import { microsoft, type Auth, type BetterAuthOptions, type SocialProviders } from 'better-auth'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { useLatestAuthInstance } from '../internal/useLatestAuthInstance'
import { useEvent } from '#build/types/nitro-imports'

interface NavigateOption { provider: string, callbackURL: string }

export function provideBetterAuthInstance(auth: Auth<BetterAuthOptions>) {
  const helper = createHelper(auth)
  const ins = useLatestAuthInstance()
  ins.auth = auth
  ins.helper = helper
}  

export function createHelper(auth: Auth<BetterAuthOptions>) {
  async function requireSession(event: H3Event = useEvent()) {
    const session = await auth.api.getSession({
      headers: event.headers,
    })
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }
    return session
  }

  async function useUserSession(event: H3Event = useEvent()) {
    const res = await auth.api.getSession({
      headers: event.headers,
    })
    return {
      user: res?.user,
      session: res?.session,
    }
  }

  async function requireUserSession(event: H3Event = useEvent()) {
    const res = await auth.api.getSession({
      headers: event.headers,
    })
    if (!res?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }    
    return {
      user: res?.user,
      session: res?.session,
    }
  }

  async function navigateSocialSignIn(
    options: NavigateOption, 
    event: H3Event = useEvent()
  ) {
    const res = await auth.api.signInSocial({
      body: {
        provider: options.provider,
        callbackURL: options.callbackURL,
      },
      asResponse: true,
      headers: event.headers,
    })

    const body = await res.json() as {
      url: string
      redirect: boolean
    }

    if (body.redirect) {
      const redirectHeaders = new Headers()
      redirectHeaders.set('Location', body.url)
      redirectHeaders.set('Set-Cookie', res.headers.get('Set-Cookie')!)
      const redirectResponse = new Response(null, {
        status: 302,
        headers: redirectHeaders,
      })
      return redirectResponse
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Auth provider error (no redirect URL)',
    })
  }

  function useAuthServer(event: H3Event = useEvent()) {
    return {
      auth,
      requireSession: async () => { return await requireSession(event) },
      useUserSession: async () => { return await useUserSession(event) },
      navigateSocialSignIn: async (opt: NavigateOption) => { return await navigateSocialSignIn(opt, event) },
    }
  }

  return {
    useAuthServer,
    requireSession,
    useUserSession,
    requireUserSession,
    navigateSocialSignIn,
  }
}
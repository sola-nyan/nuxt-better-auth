import { type Auth, type BetterAuthOptions, type InferSession, type InferUser } from 'better-auth'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { useLatestAuthInstance } from '../internal/useLatestAuthInstance'
import { useRequestEvent } from "#imports"
interface NavigateOption { provider: string, callbackURL: string }

export function provideBetterAuthInstance<T extends Auth<X>, X extends BetterAuthOptions>(auth: T) {
  const helper = createHelper(auth)
  const ins = useLatestAuthInstance()
  ins.auth = auth
  ins.helper = helper
  return helper
}  

/**
 * Please help, solve "createHelper" typing pazzle.
 */
interface BetterAuthInstanceLikeFabricatedTypeForCreateHelper {
  api: {
    getSession: (options: { headers: Headers }) => Promise<any>
    signInSocial?: (options: any ) => Promise<any>
  }
  $Infer: {
    Session: {
      session: any
      user: any;
    }
  }
}

export const createHelper = <T extends BetterAuthInstanceLikeFabricatedTypeForCreateHelper>(auth: T) => {
  async function requireSession(event: H3Event = useRequestEvent()!) {
    const session = await auth.api.getSession({
      headers: event.headers,
    })
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }
    return session as T["$Infer"]["Session"]
  }

  async function useUserSession(event: H3Event = useRequestEvent()!) {
    const res = await auth.api.getSession({
      headers: event.headers,
    })
    return {
      user: res?.user as T["$Infer"]["Session"]["user"],
      session: res?.session as T["$Infer"]["Session"],
    }
  }

  async function requireUserSession(event: H3Event = useRequestEvent()!) {
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
      user: res?.user as T["$Infer"]["Session"]["user"],
      session: res?.session as T["$Infer"]["Session"],
    }
  }

  async function navigateSocialSignIn(
    options: NavigateOption, 
    event: H3Event
  ) {
    const res = await auth.api!.signInSocial!({
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

  function useAuthServer(event: H3Event = useRequestEvent()!) {
    return {
      requireSession: async () => { return await requireSession(event) },
      useUserSession: async () => { return await useUserSession(event) },
      requireUserSession: async () => { return await requireUserSession(event) },
      navigateSocialSignIn: async (opt: NavigateOption) => { return await navigateSocialSignIn(opt, event) },
    }
  }

  return {
    useAuthServer,
    navigateSocialSignIn,
    requireUserSession,
    requireSession,
    useUserSession
  }
}
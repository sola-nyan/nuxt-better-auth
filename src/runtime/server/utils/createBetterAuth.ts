import type { Auth, BetterAuthOptions } from 'better-auth'
import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { createError } from 'h3'
import { useLatestAuthInstance } from '../internal/useLatestAuthInstance'

export function createBetterAuth<Options extends BetterAuthOptions>(option: Options & Record<never, never>) {
  const auth = BetterAuthFactory(option)
  function useAuthServer(event: H3Event) {
    return {
      client: auth,
      requireSession: () => { return requireSession(event) },
      useUserSession: () => { return useUserSession(event) },
    }
  }

  async function requireSession(event: H3Event) {
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

  async function useUserSession(event: H3Event) {
    const res = await auth.api.getSession({
      headers: event.headers,
    })
    return {
      user: res?.user,
      session: res?.session,
    }
  }

  async function navigateSocialSignIn(event: H3Event, options: { provider: string, callbackURL: string }) {
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

  const result = {
    auth,
    useAuthServer,
    requireSession,
    useUserSession,
    navigateSocialSignIn,
  }

  const ins = useLatestAuthInstance()
  ins.result = result as ReturnType<typeof createBetterAuth<BetterAuthOptions>>

  return result
}

function BetterAuthFactory<Options extends BetterAuthOptions>(option: Options & Record<never, never>): Auth<Options> {
  return betterAuth(option)
}

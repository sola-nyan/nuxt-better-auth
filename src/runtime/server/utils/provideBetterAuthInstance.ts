import { betterAuth, type Auth, type BetterAuthOptions } from 'better-auth'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { useLatestAuthInstance } from '../internal/useLatestAuthInstance'
interface NavigateOption { provider: string, callbackURL: string }

export function provideBetterAuthInstance<O extends BetterAuthOptions>(auth: Auth<O>) {
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
    signInSocial: (options: any ) => Promise<any>
  }
  $Infer: {
    Session: {
      session: any
      user: any;
    }
  }
}

type signInSocialAPI = ReturnType<typeof betterAuth<BetterAuthOptions>>["api"]["signInSocial"]

export const createHelper = <O extends BetterAuthOptions>(auth: Auth<O>) => {
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
    return session as (typeof auth)["$Infer"]["Session"]
  }

  async function useUserSession(event: H3Event) {
    const res = await auth.api.getSession({
      headers: event.headers,
    })
    return {
      user: res?.user as (typeof auth)["$Infer"]["Session"]["user"],
      session: res?.session as (typeof auth)["$Infer"]["Session"]["session"],
    }
  }

  async function requireUserSession(event: H3Event) {
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
      user: res?.user as (typeof auth)["$Infer"]["Session"]["user"],
      session: res?.session as (typeof auth)["$Infer"]["Session"]["session"],
    }
  }

  async function navigateSocialSignIn(
    options: NavigateOption, 
    event: H3Event
  ) {
    const _auth = auth as unknown as BetterAuthInstanceLikeFabricatedTypeForCreateHelper
    const api = _auth.api.signInSocial as signInSocialAPI
    const res = await api({
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

  function useAuthServer(event: H3Event) {
    return {
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
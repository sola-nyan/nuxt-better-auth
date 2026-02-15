import { betterAuth } from 'better-auth'
import type { H3Event } from 'h3'

if (!process.env.AUTH_PROVIDERS_ENTRA_CLIENT_ID)
  throw new Error('NO ENV SET: AUTH_PROVIDERS_ENTRA_CLIENT_ID')
if (!process.env.AUTH_PROVIDERS_ENTRA_CLIENT_SECRET)
  throw new Error('NO ENV SET: AUTH_PROVIDERS_ENTRA_CLIENT_SECRET')

export type UserInfo = typeof auth.$Infer.Session.user
export type SessionInfo = typeof auth.$Infer.Session.session

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  secret: process.env.AUTH_SESSION_SECRET,
  baseURL: `${process.env.BASE_URL}/api/auth`,
  socialProviders: {
    microsoft: {
      clientId: process.env.AUTH_PROVIDERS_ENTRA_CLIENT_ID,
      clientSecret: process.env.AUTH_PROVIDERS_ENTRA_CLIENT_SECRET,
      tenantId: process.env.AUTH_PROVIDERS_ENTRA_TENANT_ID,
      prompt: 'select_account',
    },
  },
  user: {
    additionalFields: {
      empId: { type: 'string', required: true, input: false },
      dept: { type: 'string', required: true, input: false },
      admin: { type: 'boolean', required: true, input: false },
    },
  },
})

export const { 
  useAuthServer,
  requireSession,
  requireUserSession,
  useUserSession
} = provideBetterAuthInstance(auth)

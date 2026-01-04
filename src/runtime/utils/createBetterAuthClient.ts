import type { Session, User } from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'
import { createAuthClient } from 'better-auth/vue'
import type { ComputedRef } from 'vue'
import { computed, navigateTo, useFetch } from '#imports'

type AnyRec = Record<string, unknown>
type Merge<Base, Add> = Base & (Add extends AnyRec ? Add : object)
type PickIfExists<T, K extends PropertyKey> = K extends keyof T ? NonNullable<T[K]> : object

export async function createBetterAuthClient<
  AddFields extends { user?: AnyRec, session?: AnyRec } = object,
>(
  config?: Parameters<typeof createAuthClient>[0],
): Promise<{
  client: ReturnType<typeof createAuthClient>
  loggedIn: ComputedRef<boolean>
  user: ComputedRef<Merge<User, PickIfExists<AddFields, 'user'>> | null>
  session: ComputedRef<Merge<Session, PickIfExists<AddFields, 'session'>> | null>
  signUp: ReturnType<typeof createAuthClient>['signUp']
  signIn: ReturnType<typeof createAuthClient>['signIn']
  signOut: (option?: { redirectTo?: RouteLocationRaw }) => Promise<void>
}> {
  const client = createAuthClient(config)

  const res = await client.useSession(useFetch)

  const loggedIn = computed(() => Boolean(res.data.value?.session))
  const user = computed(() => res.data.value?.user ?? null) as ComputedRef<Merge<User, PickIfExists<AddFields, 'user'>> | null>
  const session = computed(() => res.data.value?.session ?? null) as ComputedRef<Merge<Session, PickIfExists<AddFields, 'session'>> | null>

  const result = {
    client,
    loggedIn,
    user,
    session,
    signIn: client.signIn,
    signUp: client.signUp,
    async signOut(option?: { redirectTo?: RouteLocationRaw }) {
      await client.signOut()
      await navigateTo(option?.redirectTo ?? '/', { external: true, replace: true })
    },
  }

  return result
}

import type { Auth, BetterAuthOptions } from 'better-auth'
import type { createHelper } from '../utils/provideBetterAuthInstance'

const $singleton = {
  auth: undefined as undefined | Auth<BetterAuthOptions>,
  helper: undefined as undefined | ReturnType<typeof createHelper>
}

export function useLatestAuthInstance() {
  return $singleton
}

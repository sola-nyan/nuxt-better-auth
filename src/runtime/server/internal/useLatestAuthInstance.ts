import type { BetterAuthOptions } from 'better-auth'
import type { createBetterAuth } from '../utils/createBetterAuth'

const $singleton = {
  result: undefined as undefined | ReturnType<typeof createBetterAuth<BetterAuthOptions>>,
}

export function useLatestAuthInstance() {
  return $singleton
}

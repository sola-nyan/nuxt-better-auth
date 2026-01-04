import { useRuntimeConfig } from '#app'
import type { ModuleOptions } from '../../module'

export function useModuleOption() {
  const cfg = useRuntimeConfig()
  return cfg.public.__betterAuth as ModuleOptions | undefined
}

import { addImportsDir, addServerHandler, addServerImports, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  enable: boolean
  protectPathRoot: string | string[]
}

const MODULE_NAME = '@sola-nyan/nuxt-better-auth'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'better-auth',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {
    enable: true,
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    /**
     * Inject Server Util : createBetterAuth
     */
    addServerImports([{
      from: resolver.resolve('./runtime/server/utils/createBetterAuth'),
      name: 'createBetterAuth',
    }])

    /**
     * Inject Util
     */
    addImportsDir(resolver.resolve('./runtime/utils'))

    /**
     * Inject Server Handler
     */
    addServerHandler({
      handler: resolver.resolve('./runtime/server/handler/auth'),
      route: '/api/auth/**',
    })
  },
})

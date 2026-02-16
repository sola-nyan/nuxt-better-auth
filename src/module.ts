import { addRouteMiddleware, createError } from '#app'
import { addImportsDir, addServerHandler, addServerImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { SocialProvider, SocialProviders } from 'better-auth'
import { createAuthClient } from 'better-auth/client'

export interface ModuleOptions {
  handler: {
    enable: boolean
    route?: string
  }
}

const MODULE_NAME = '@sola-nyan/nuxt-better-auth'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'betterAuth',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {
    handler: {
      enable: true,
      route: "/api/auth/**"
    }
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    /**
     * Inject Server Util : createBetterAuth
     */
    addServerImports([{
      from: resolver.resolve('./runtime/server/utils/provideBetterAuthInstance'),
      name: 'provideBetterAuthInstance',
    }])

    /**
     * Inject Util
     */
    addImportsDir(resolver.resolve('./runtime/utils'))


    if (_options.handler.enable) {
      /**
       * Inject Server Handler
       */
      addServerHandler({
        handler: resolver.resolve('./runtime/server/handler/auth'),
        route: _options.handler.route,
      })
    }
  },
})

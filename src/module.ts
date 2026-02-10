import { addImportsDir, addServerHandler, addServerImports, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { SocialProviders } from 'better-auth'

interface PageRouteOption {
  path: string
  auth: boolean
  provider: keyof SocialProviders
  callbackURL: string
}

interface APIRouteOption {
  path: string
  auth: boolean
}
export interface ModuleOptions {
  enable: boolean
  routeGuard: {
    pages: PageRouteOption[],
    apis: APIRouteOption[]

  }
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
      from: resolver.resolve('./runtime/server/utils/provideBetterAuthInstance'),
      name: 'provideBetterAuthInstance',
    }])

    /**
     * Inject Util
     */
    addImportsDir(resolver.resolve('./runtime/utils'))


    if (_options.enable) {
      /**
       * Inject Server Handler
       */
      addServerHandler({
        handler: resolver.resolve('./runtime/server/handler/auth'),
        route: '/api/auth/**',
      })
    
      // /**
      //  * Inject Server Middleware
      //  */
      // addServerHandler({
      //   handler: resolver.resolve('./runtime/server/middleware/routeGuard'),
      //   middleware: true
      // })
    }   
    
    
  },
})

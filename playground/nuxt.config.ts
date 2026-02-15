export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2024-08-21',
  "better-auth": {
    handler: {
      enable: true,
      route: "/api/auth/**"
    }
  }
})

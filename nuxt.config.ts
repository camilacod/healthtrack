// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/theme.css'],
  // Ensure `$fetch` is auto-imported from ofetch instead of `#app`
  imports: {
    presets: [
      {
        from: 'ofetch',
        imports: ['$fetch'],
      },
    ],
  },
  runtimeConfig: {
    // Private runtime config, available server-side
    sessionSecret: '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  }
})

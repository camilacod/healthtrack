export {}

// Minimal shims so TypeScript in this environment understands Nuxt auto-imports
declare function definePageMeta(meta: any): void
declare function navigateTo(to: any): void
declare function useRoute(): any

declare function $fetch(input: any, init?: any): Promise<any>



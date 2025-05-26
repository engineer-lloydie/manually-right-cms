// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    compatibilityDate: '2025-02-11',
    devtools: { enabled: false },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.BASE_URL
        }
    },
    modules: [
        'nuxt-auth-sanctum'
    ],
    plugins: [
        '~/plugins/url-slug.mjs'
    ],
    components: { 
        dirs: [ 
            '~/components',
            '~/layouts',
        ]
    },
    build: {
        transpile: ['vuetify'],
    },
    vite: {
        plugins: [vuetify({ autoImport: true })],
        ssr: {
            noExternal: ['vuetify']
        },
        vue: {
            template: {
                transformAssetUrls,
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ['legacy-js-api']
                }
            }
        }
    },
    sanctum: {
        baseUrl: process.env.AUTH_BASE_URL,
        mode: 'token',
        endpoints: {
            login: '/api/login',
            logout: '/api/logout'
        },
        redirect: {
            onLogin: '/dashboard',
            onLogout: '/',
            onAuthOnly: '/',
            onGuestOnly: '/dashboard'
        },
        globalMiddleware: {
            enabled: true,
        }
    }
})
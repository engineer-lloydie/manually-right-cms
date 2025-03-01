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
        (_options, nuxt) => {
            nuxt.hooks.hook('vite:extendConfig', (config) => {
                // @ts-expect-error
                config.plugins.push(vuetify({ autoImport: true }))
            })
        }
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
    }
})

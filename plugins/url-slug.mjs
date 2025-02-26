export default defineNuxtPlugin((nuxtApp) => {    
    return {
        provide: {
            slugify: (text) => {
                return text
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]/g, '');
            }
        }
    }
})
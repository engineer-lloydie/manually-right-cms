export default defineNuxtPlugin((nuxtApp) => {
    const { login, logout } = useSanctumAuth();
    
    return {
        provide: {
            login: async (values, strategy) => {
                try {
                    values.auth_method = strategy;
                    values.source = 'admin'
                    await login(values);
                } catch (error) {
                    throw error;
                }
            },
            logout: async () => {
                try {
                    await logout();
                } catch (error) {
                    throw error;
                }
            }
        }
    }
})
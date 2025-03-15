<template>
    <div>
        <v-img 
            width="100vw"
            height="100vh"
            aspect-ratio="4/3"
            class="position-relative"
            cover
            src="~/assets/images/hero.jpg"
        >
            <v-card class="login-card" position="absolute" width="500" elevation="10">
                <v-card-text>
                    <v-img class="mb-5" src="~/assets/images/partial-logo.png" height="100"></v-img>
                    <form @submit.prevent="signin">
                        <v-text-field
                            v-model="email_address.value.value"
                            :error-messages="email_address.errorMessage.value"
                            variant="outlined"
                            clearable
                            label="Email Address"
                        ></v-text-field>
                        
                        <v-text-field
                            v-model="password.value.value"
                            :error-messages="password.errorMessage.value"
                            :append-inner-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                            :type="passwordVisible ? 'text' : 'password'"
                            variant="outlined"
                            clearable
                            label="Password"
                            @click:append-inner="passwordVisible = !passwordVisible"
                        ></v-text-field>

                        <v-alert
                            v-if="errorMessage"
                            density="compact"
                            :text="errorMessage"
                            type="error"
                            closable
                        ></v-alert>

                        <v-btn
                            class="mt-2 mb-4 text-none"
                            type="submit"
                            color="red-lighten-1"
                            block
                            :loading="loading"
                        >
                            Sign In
                        </v-btn>
                    </form>
                </v-card-text>
            </v-card>
        </v-img>
    </div>
</template>

<script setup>
import { useField, useForm } from 'vee-validate'

definePageMeta({
    title: 'Login',
    layout: false
});

const errorMessage = ref(null);
const loading = ref(false);

const { handleSubmit } = useForm({
    validationSchema: {
        email_address (value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailRegex.test(value)) return true

            return 'Must be a valid e-mail.'
        },
        password (value) {
            if (value?.length >= 8) return true

            return 'Password needs to be at least 8 characters.'
        }
    },
})

const email_address = useField('email_address')
const password = useField('password')
const passwordVisible = ref(false);

const { $login } = useNuxtApp()

const signin = handleSubmit(async (values) => {
    try {
        loading.value = true;
        errorMessage.value = null;
        await $login(values, 'email_password');
    } catch (error) {
        if (error?.response && error?.response?._data?.message) {
            errorMessage.value = error.response._data.message;
        } else {
            errorMessage.value = "Something went wrong. Please try again."
        }
    } finally {
        loading.value = false;
    }
})
</script>

<style scoped>
.login-card {
    position: absolute;
    top: 20vh;
    /* bottom: 0; */
    left: 0;
    right: 0;
    margin: auto;
}
</style>
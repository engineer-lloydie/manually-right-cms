<template>
    <NuxtLayout>
        <v-app>
            <NuxtPage />
        </v-app>
    </NuxtLayout>
</template>

<script setup>
const route = useRoute();

const pageTitle = computed(() => {
    return route.meta.title;
});

useHead({
    title: () => `${pageTitle.value} - Admin ManuallyRight`
});
</script>
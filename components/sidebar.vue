<template>
    <div>
        <v-card>
            <v-layout>
                <v-navigation-drawer
                    v-model="drawer"
                    :rail="rail"
                    @click="rail = false"
                    :mobile="false"
                    absolute
                >
                    <v-list-item
                        title="ManuallyRight"
                    >
                        <template v-slot:append>
                            <v-btn
                                :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
                                variant="text"
                                @click.stop="rail = !rail"
                            ></v-btn>
                        </template>
                    </v-list-item>
    
                    <v-divider></v-divider>
    
                    <v-list density="compact" nav>
                        <v-list-item
                            prepend-icon="mdi-home-city"
                            title="Dashboard"
                            exact
                            to="/dashboard"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-list-box"
                            title="Categories"
                            exact
                            to="/categories"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-file-document-multiple"
                            title="Manuals"
                            exact
                            to="/manuals"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-invoice-list"
                            title="Orders"
                            exact
                            to="/orders"
                        ></v-list-item>
                        <v-list-item
                            prepend-icon="mdi-view-carousel"
                            title="Banners"
                            exact
                            to="/banners"
                        ></v-list-item>

                        <v-list-item
                            prepend-icon="mdi-book-open-page-variant"
                            title="Site Pages"
                            exact
                            to="/site-pages"
                        ></v-list-item>

                        <v-list-item
                            prepend-icon="mdi-card-search"
                            title="Site Meta"
                            exact
                            to="/site-meta"
                        ></v-list-item>
    
                        <v-divider></v-divider>
    
                        <v-list-item
                            prepend-icon="mdi-logout"
                            title="Logout"
                            class="cursor-pointer"
                            @click="logoutDialog = true"
                        ></v-list-item>
                    </v-list>
                </v-navigation-drawer>
                <v-main>
                    <v-container>
                        <slot name="main"/>
                    </v-container>
                </v-main>
            </v-layout>
        </v-card>

        <v-dialog
            v-model="logoutDialog"
            width="auto"
        >
            <v-card
                max-width="400"
                prepend-icon="mdi-update"
                text="Are you sure you want to logout?"
                title="Logout"
            >
                <template v-slot:actions>
                    <v-btn
                        class="ms-auto"
                        text="Cancel"
                        @click="logoutDialog = false"
                    ></v-btn>
                    <v-btn
                        class="ms-auto"
                        text="Yes"
                        @click="logoutUser"
                    ></v-btn>
                </template>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
const drawer = ref(true);
const rail = ref(false);

const logoutDialog = ref(false);

const { $logout } = useNuxtApp()

const logoutUser = (async () => {
    try {
        await $logout();
        logoutDialog.value = false;
    } catch (error) {
        console.error(error)
    }
})
</script>
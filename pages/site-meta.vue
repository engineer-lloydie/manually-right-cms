<template>
    	<div>
		<h3>Site Meta Tags</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-card-text>
                <v-data-table-server
                    :items-per-page="itemsPerPage"
                    :items-per-page-options="[10, 25, 50, 100]"
                    :headers="headers"
                    :items="serverItems"
                    :items-length="totalItems"
                    :loading="loading"
                    item-value="title"
                    :row-props="getItemClass"
                    :search="searchQuery"
                    @update:options="loadSitePages"
                >
                <template #item.actions="{ item }">
                        <v-icon
                            class="me-2"
                            size="small"
                            @click="setItemToEdit(item)"
                        >
                            mdi-eye-arrow-right-outline
                        </v-icon>>
                    </template>
                </v-data-table-server>
			</v-card-text>
		</v-card>

		<!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card title="View Site Meta Tag">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
                        @click="itemDialog = false"
					></v-btn>
				</template>
				<v-container>
                    <v-textarea
                        v-model="title"
                        label="Title"
                        variant="outlined"
                        disabled
                    ></v-textarea>
                    <v-textarea
                        v-model="description"
                        label="Description"
                        variant="outlined"
                        rows="5"
                        disabled
                    ></v-textarea>
				</v-container>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import debounce from "lodash/debounce";

definePageMeta({
    title: 'Site Meta Tags'
})

const headers = ref([
	{ title: "Title", key: "title", align: "start" },
	{ title: "Description", key: "description", align: "start", sortable: false },
    { title: "Actions", key: "actions", align: "end", sortable: false }
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(10);

const currentPage = ref(1);

const itemDialog = ref(false);
const editDialog = ref(false);

const selectedPageId = ref(null);

const searchQuery = ref(null);

// Site Page Form Fields
const title = ref(null);
const description = ref(null);

const config = useRuntimeConfig();

const loadSitePages = debounce(async ({ page, itemsPerPage, sortBy, search }) => {
    try {
        loading.value = true;
        currentPage.value = page;

        const { data, total } = await $fetch(`${config.public.apiBaseUrl}/admin/meta-tags`, {
            method: 'GET',
            params: {
                page,
                itemsPerPage,
                sortBy,
                search,
            }
        });

        serverItems.value = data;
        totalItems.value = total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}, 500);

const setItemToEdit = (item) => {
    editDialog.value = true;
    itemDialog.value = true;

    selectedPageId.value = item.id
    title.value = item.title;
    description.value = item.description;
}

const getItemClass = (item) => {
    if (item.item.id === selectedPageId.value) {
        return { class: 'bg-red-lighten-1' };
    }

    return {};
}
</script>

<style lang="scss" scoped>

</style>
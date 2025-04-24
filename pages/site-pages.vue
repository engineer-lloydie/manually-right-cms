<template>
    	<div>
		<h3>Site Pages</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-card-text>
                <v-sheet class="d-flex justify-space-between align-center my-1">
                    <div>
                        <v-btn
                            color="red-lighten-1"
                            @click="itemDialog = true"
                        >
                            Add New
                        </v-btn>
                    </div>
                    <div>
                        <v-text-field
                            v-model="searchQuery"
                            density="comfortable"
                            label="Search site pages"
                            variant="outlined"
                            width="400"
                            append-inner-icon="mdi-magnify"
                        ></v-text-field>
                    </div>
                </v-sheet>

                <v-data-table-server
                    :items-per-page="itemsPerPage"
                    :items-per-page-options="[10, 25, 50, 100]"
                    :headers="headers"
                    :items="serverItems"
                    :items-length="totalItems"
                    :loading="loading"
                    item-value="name"
                    :search="searchQuery"
                    @update:options="loadSitePages"
                >
                    <template #item.actions="{ item }">
                        <v-icon
                            class="me-2"
                            size="small"
                            @click="setItemToEdit(item)"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon
                            class="me-2"
                            size="small" 
                            @click="deleteConfirmation = true; selectedPageId = item.id"
                        >
                            mdi-delete
                        </v-icon>
                        <v-icon 
                            size="small" 
                            @click="setupMetaTags(item)"
                        >
                            mdi-card-search
                        </v-icon>
                    </template>
                </v-data-table-server>
			</v-card-text>
		</v-card>

		<!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card :title="(editDialog ? 'Edit' : 'Add') + ' site pages'">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
						@click="resetValues"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="handleFormSubmission">
						<v-text-field
							v-model="pageName.value.value"
							:error-messages="pageName.errorMessage.value"
							label="Page Name"
							variant="outlined"
						></v-text-field>
						<v-text-field
							v-model="urlSlug.value.value"
                            :error-messages="urlSlug.errorMessage.value"
							label="Url Slug"
							variant="outlined"
						></v-text-field>
						<v-select
							v-model="status.value.value"
							:error-messages="status.errorMessage.value"
							:items="statusItems"
							label="Status"
							variant="outlined"
						></v-select>

						<v-btn class="me-4 mt-4" :loading="modifying" type="submit"> submit </v-btn>

						<v-btn class="mt-4" @click="handleReset"> clear </v-btn>
					</form>
				</v-container>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteConfirmation" width="auto">
			<v-card
				max-width="400"
				prepend-icon="mdi-delete-circle"
				text="Are you sure you want to delete this site page?"
				title="Delete site page"
			>
				<template v-slot:actions>
					<v-btn
                        :loading="modifying"
						class="ms-auto"
						text="Yes"
                        color="error"
						@click="deletePage"
					></v-btn>
				</template>
			</v-card>
		</v-dialog>

        <v-dialog v-model="successDialog" width="auto">
			<v-card
				max-width="400"
				prepend-icon="mdi-check"
				:text="successMessage"
				title="Success"
			>
				<template v-slot:actions>
					<v-btn
						class="ms-auto"
						text="Close"
                        color="grey"
						@click="successDialog = false; successMessage = null"
					></v-btn>
				</template>
			</v-card>
		</v-dialog>

        <v-dialog v-model="metaTagDialog" max-width="500">
            <v-card title="Setup Meta Tags">
                <MetaTag
                    :item="selectedItem"
                    :model="'site_page'"
                    @success="handleMetaTagSubmission"/>
    
                <template v-slot:actions>
                    <v-btn
                        class="ml-auto"
                        text="Close"
                        @click="metaTagDialog = false; successMessage = null"
                    ></v-btn>
                </template>
            </v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import MetaTag from "~/components/meta-tag.vue";
import * as yup from "yup";
import debounce from "lodash/debounce";

definePageMeta({
    title: 'Site Pages'
})

const headers = ref([
	{ title: "Page Name", key: "name", align: "start" },
	{ title: "URL Slug", key: "url_slug", align: "start", sortable: false },
	{ title: "Status", key: "status", align: "start", sortable: false },
	{ title: "Actions", key: "actions", align: "end" },
]);

const serverItems = ref([]);
const loading = ref(true);
const modifying = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(10);

const currentPage = ref(1);

const itemDialog = ref(false);
const editDialog = ref(false);
const metaTagDialog = ref(false);

const deleteConfirmation = ref(false);
const successDialog = ref(false);
const successMessage = ref(null);

const selectedPageId = ref(null);
const selectedItem = ref(null);

const searchQuery = ref(null);

const schema = yup.object({
    pageName: yup.string().required("Page name is required."),
    urlSlug: yup.string().required("Url slug is required."),
	status: yup.string().required("Status is required."),
});

const { handleSubmit, handleReset } = useForm({
	validationSchema: schema,
    initialValues: {
        status: "Active"
    },
});

// Site Page Form Fields
const pageName = useField("pageName");
const urlSlug = useField("urlSlug");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

const config = useRuntimeConfig();

const loadSitePages = debounce(async ({ page, itemsPerPage, sortBy, search }) => {
    try {
        loading.value = true;
        currentPage.value = page;

        const { data, total } = await $fetch(`${config.public.apiBaseUrl}/admin/site-pages`, {
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

const resetValues = () => {
    itemDialog.value = false;
    editDialog.value = false;
    metaTagDialog.value = false;
    handleReset();
}

const handleFormSubmission = handleSubmit(async (values) => {
    if (!editDialog.value) {
        addSitePage(values);
    } else {
        updateSitePage(values);
    }
});

const addSitePage = async (values) => {
	try {
        modifying.value = true;
        const { message } = await useBaseFetch('/admin/site-pages', {
            method: 'POST',
            body: values
        });

        itemDialog.value = false
        successMessage.value = message;
        loadSitePages({page: 1, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
};

const setItemToEdit = (item) => {
    editDialog.value = true;
    itemDialog.value = true;

    selectedPageId.value = item.id
    pageName.value.value = item.name;
    urlSlug.value.value = item.url_slug;
    status.value.value = item.status;
}

const updateSitePage = async (values) => {
	try {
        modifying.value = true;
        const { message } = await useBaseFetch(`/admin/site-pages/${selectedPageId.value}`, {
            method: 'PUT',
            body: values
        });

        itemDialog.value = false;
        editDialog.value = false;
        successMessage.value = message;
        loadSitePages({page: currentPage.value, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
};

const deletePage = async () => {
	try {
        modifying.value = true;
        const { message } = await useBaseFetch(`/admin/site-pages/${selectedPageId.value}`, {
            method: 'DELETE'
        });

        deleteConfirmation.value = false
        successMessage.value = message;
        loadSitePages({page: currentPage.value, itemsPerPage: 10});
        successDialog.value = true;
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
};

const setupMetaTags = (item) => {
    metaTagDialog.value = true;
    selectedItem.value = item;
}

const handleMetaTagSubmission = (message) => {
    successMessage.value = message;
    successDialog.value = true;
    loadSitePages({page: currentPage.value, itemsPerPage: 10});
}
</script>

<style lang="scss" scoped>

</style>
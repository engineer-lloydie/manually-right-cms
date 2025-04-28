<template>
	<div>
		<h3>Manuals</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-card-text>
                <v-sheet class="d-flex justify-space-between align-center">
                    <div>
                        <v-btn
                            color="red-lighten-1"
                            @click="itemDialog = true; loadSubCategories()"
                        >
                            Add New
                        </v-btn>
                    </div>

                    <div>
                        <v-text-field
                            v-model="searchQuery"
                            density="comfortable"
                            label="Search manuals"
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
                    :search="searchQuery"
                    item-value="name"
                    :row-props="getItemClass"
                    @update:options="loadManuals"
                >
                    <template #item.description="{ item }">
                        <p>{{ item.description ?? 'N/A' }}</p>
                    </template>
                    <template #item.actions="{ item }">
                        <v-btn
                            size="small"
                            icon="mdi-pencil"
                            @click="setItemToEdit(item); loadSubCategories()"
                            density="comfortable"
                            flat
                        ></v-btn>
                        <v-btn
                            size="small"
                            icon="mdi-delete" 
                            @click="deleteConfirmation = true; selectedManualId = item.id"
                            density="comfortable"
                            flat
                        ></v-btn>
                        <v-tooltip text="Add Manual Documents and Thumbnails">
                            <template v-slot:activator="{ props }">
                                <v-btn 
                                    v-bind="props"
                                    size="small"
                                    icon="mdi-file-account" 
                                    density="comfortable"
                                    flat
                                    :to="`/manuals/${item.id}`"
                                ></v-btn>
                            </template>
                        </v-tooltip>
                        <v-btn
                            size="small"
                            icon="mdi-card-search" 
                            @click="setupMetaTags(item)"
                            density="comfortable"
                            flat
                        ></v-btn>
                    </template>
                </v-data-table-server>
			</v-card-text>
		</v-card>

        <!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card :title="(editDialog ? 'Edit' : 'Add') + ' manual'">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
						@click="resetValues"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="handleManualForm">
						<v-select
							v-model="categoryId.value.value"
							:error-messages="categoryId.errorMessage.value"
							:items="categoryLists"
                            item-value="id"
                            item-title="name"
							label="Category"
							variant="outlined"
                            :loading="loadingCategories"
						></v-select>
                        <v-text-field
							v-model="title.value.value"
							:error-messages="title.errorMessage.value"
							label="Title"
							variant="outlined"
						></v-text-field>
						<v-textarea
							v-model="description.value.value"
							label="Description (Optional)"
							variant="outlined"
						></v-textarea>
                        <v-text-field
							v-model="price.value.value"
                            :error-messages="price.errorMessage.value"
							label="Price"
							variant="outlined"
						></v-text-field>
						<v-select
							v-model="status.value.value"
							:error-messages="status.errorMessage.value"
							:items="statusItems"
							label="Status"
							variant="outlined"
						></v-select>

						<v-btn class="me-4 mt-4" type="submit"> submit </v-btn>

						<v-btn class="mt-4" @click="handleReset"> clear </v-btn>
					</form>
				</v-container>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteConfirmation" width="auto">
			<v-card
				max-width="400"
				prepend-icon="mdi-delete-circle"
				text="Are you sure you want to delete this category?"
				title="Delete Category"
			>
				<template v-slot:actions>
					<v-btn
						class="ms-auto"
						text="Yes"
                        color="error"
						@click="deleteManual()"
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
                    :model="'manual'"
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
import * as yup from "yup";
import debounce from "lodash/debounce";

definePageMeta({
    title: 'Manuals'
});

const headers = ref([
    { title: "Category", key: "category", align: "start" },
    { title: "Title", key: "title", align: "end", sortable: false },
	{ title: "Description", key: "description", sortable: false, align: "end" },
    { title: "Price", key: "price", align: "end", sortable: false },
	// { title: "URL Slug", key: "url_slug", align: "start", sortable: false },
	{ title: "Status", key: "status", align: "start", sortable: false },
	{ title: "Actions", key: "actions", align: "end", sortable: false, width: 200 },
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(10);

const currentPage = ref(1);

const itemDialog = ref(false);
const editDialog = ref(false);
const metaTagDialog = ref(false);

const deleteConfirmation = ref(false);
const successDialog = ref(false);
const successMessage = ref(null);

const selectedManualId = ref(null);
const selectedItem = ref(null);

const searchQuery = ref(null);

const loadingCategories = ref(false);
const categoryLists = ref([]);

const schema = yup.object({
    categoryId: yup.number().required("Category is required."),
    title: yup.string().required("Title is required."),
    price: yup.string().required("Price is required."),
	status: yup.string().required("Status is required."),
});

const { handleSubmit, handleReset } = useForm({
	validationSchema: schema,
    initialValues: {
        status: "Active"
    },
});

const categoryId = useField("categoryId");
const title = useField("title");
const description = useField("description");
const price = useField("price");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

const config = useRuntimeConfig();

const loadManuals = debounce(async ({ page, itemsPerPage, sortBy, search }) => {
    try {
        loading.value = true;
        currentPage.value = page;

        const { data, total } = await $fetch(`${config.public.apiBaseUrl}/admin/manuals`, {
            method: 'GET',
            params: {
                page,
                itemsPerPage,
                sortBy,
                search
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

const loadSubCategories = async () => {
    try {
        loadingCategories.value = true;

        const data = await useBaseFetch('/admin/sub-categories', {
            method: 'GET'
        });

        categoryLists.value = data;
    } catch (error) {
        console.error(error);
    } finally {
        loadingCategories.value = false;
    }
};

const resetValues = () => {
    itemDialog.value = false;
    editDialog.value = false;
    metaTagDialog.value = false;
    handleReset();
}

const handleManualForm = handleSubmit(async (values) => {
    const { $slugify } = useNuxtApp();
    
    values.urlSlug = $slugify(values.title);
    values.price = parseFloat(values.price);

    if (!editDialog.value) {
        addManual(values);
    } else {
        updateManual(values);
    }
});

const addManual = async (values) => {
	try {
        const { message } = await useBaseFetch('/admin/manuals', {
            method: 'POST',
            body: values
        });

        itemDialog.value = false
        successMessage.value = message;
        loadManuals({page: 1, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    }
};

const setItemToEdit = (item) => {
    editDialog.value = true;
    itemDialog.value = true;

    selectedManualId.value = item.id
    categoryId.value.value = item.sub_category_id;
    title.value.value = item.title;
    description.value.value = item.description;
    price.value.value = item.price;
    status.value.value = item.status;
}

const updateManual = async (values) => {
	try {
        const { message } = await useBaseFetch(`/admin/manuals/${selectedManualId.value}`, {
            method: 'PUT',
            body: values
        });

        itemDialog.value = false;
        editDialog.value = false;
        successMessage.value = message;
        loadManuals({page: currentPage.value, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    }
};

const deleteManual = async () => {
	try {
        const { message } = await useBaseFetch(`/admin/manuals/${selectedManualId.value}`, {
            method: 'DELETE'
        });

        deleteConfirmation.value = false
        successMessage.value = message;
        loadManuals({page: currentPage.value, itemsPerPage: 10});
        successDialog.value = true;
    } catch (error) {
        console.error(error);
    }
};

const setupMetaTags = (item) => {
    selectedManualId.value = item.id;
    metaTagDialog.value = true;
    selectedItem.value = item;
}

const handleMetaTagSubmission = (message) => {
    successMessage.value = message;
    successDialog.value = true;
    loadManuals({page: currentPage.value, itemsPerPage: 10});
}

const getItemClass = (item) => {
    if (item.item.id === selectedManualId.value) {
        return { class: 'bg-red-lighten-1' };
    }

    return {};
}
</script>

<style lang="scss" scoped>
</style>
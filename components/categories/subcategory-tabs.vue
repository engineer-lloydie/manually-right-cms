<template>
	<div>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="main">
                <v-btn
                    color="red-lighten-1"
                    @click="itemDialog = true; loadMainCategories()"
                >
                    Add New
                </v-btn>
                <v-data-table-server
                    :items-per-page="itemsPerPage"
                    :headers="headers"
                    :items="serverItems"
                    :items-length="totalItems"
                    :loading="loading"
                    item-value="name"
                    @update:options="loadCategories"
                >
                    <template #item.actions="{ item }">
                        <v-icon
                            class="me-2"
                            size="small"
                            @click="setItemToEdit(item); loadMainCategories()"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon 
                            size="small" 
                            @click="deleteConfirmation = true; selectedCategoryId = item.id"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                </v-data-table-server>
            </v-tabs-window-item>
        </v-tabs-window>

        <!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card :title="(editDialog ? 'Edit' : 'Add') + ' main category'">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
						@click="resetValues"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="handleFormSubmission">
						<v-select
							v-model="mainCategoryId.value.value"
							:error-messages="mainCategoryId.errorMessage.value"
							:items="mainCategoryLists"
                            item-value="id"
                            item-title="name"
							label="Main Category"
							variant="outlined"
                            :loading="loadingMainCategories"
						></v-select>
                        <v-text-field
							v-model="name.value.value"
							:error-messages="name.errorMessage.value"
							label="Name"
							variant="outlined"
						></v-text-field>
						<v-text-field
							v-model="description.value.value"
							label="Description (Optional)"
							variant="outlined"
						></v-text-field>
						<v-text-field
							v-model="urlSlug.value.value"
							:error-messages="urlSlug.errorMessage.value"
							label="URL Slug"
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
						@click="deleteCategory"
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
	</div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
const tab = ref("main");
import * as yup from "yup";

const headers = ref([
    { title: "Main Categories", key: "main_category", align: "start" },
	{ title: "Name", key: "name", align: "start" },
	{ title: "URL Slug", key: "url_slug", align: "start", sortable: false },
	{ title: "Status", key: "status", align: "start", sortable: false },
	{ title: "Actions", key: "actions", align: "end" },
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const itemDialog = ref(false);
const editDialog = ref(false);
const deleteConfirmation = ref(false);
const successDialog = ref(false);
const successMessage = ref(null);
const selectedCategoryId = ref(null);

const loadingMainCategories = ref(false);
const mainCategoryLists = ref([]);

const schema = yup.object({
    mainCategoryId: yup.number().required("Main category is required."),
    name: yup.string().required("Name is required."),
    urlSlug: yup.string().required("URL slug is required."),
	status: yup.string().required("Status is required."),
});

const { handleSubmit, handleReset } = useForm({
	validationSchema: schema,
    initialValues: {
        status: "Active"
    },
});

const mainCategoryId = useField("mainCategoryId");
const name = useField("name");
const description = useField("description");
const urlSlug = useField("urlSlug");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

const loadCategories = async ({ page, itemsPerPage, sortBy }) => {
    try {
        loading.value = true;

        const { data, total } = await useBaseFetch('/sub-categories', {
            method: 'GET',
            params: {
                page,
                itemsPerPage,
                sortBy,
            }
        });

        serverItems.value = data;
        totalItems.value = total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const loadMainCategories = async () => {
    try {
        loadingMainCategories.value = true;

        const data = await useBaseFetch('/main-categories', {
            method: 'GET'
        });

        mainCategoryLists.value = data;
    } catch (error) {
        console.error(error);
    } finally {
        loadingMainCategories.value = false;
    }
};

const resetValues = () => {
    itemDialog.value = false;
    editDialog.value = false;
    handleReset()
}

const handleFormSubmission = handleSubmit(async (values) => {
    if (!editDialog.value) {
        addCategory(values);
    } else {
        updateCategory(values);
    }
});

const addCategory = async (values) => {
	try {
        const { message } = await useBaseFetch('/sub-categories', {
            method: 'POST',
            body: values
        });

        itemDialog.value = false
        successMessage.value = message;
        loadCategories({page: 1, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    }
};

const setItemToEdit = (item) => {
    editDialog.value = true;
    itemDialog.value = true;

    selectedCategoryId.value = item.id
    mainCategoryId.value.value = mainCategoryLists.value.find(list => list.main_category_id == item.main_category_id).id;
    name.value.value = item.name;
    description.value.value = item.description;
    urlSlug.value.value = item.url_slug;
    status.value.value = item.status;
}

const updateCategory = async (values) => {
	try {
        const { message } = await useBaseFetch(`/sub-categories/${selectedCategoryId.value}`, {
            method: 'PUT',
            body: values
        });

        itemDialog.value = false;
        editDialog.value = false;
        successMessage.value = message;
        loadCategories({page: 1, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    }
};

const deleteCategory = async () => {
	try {
        const { message } = await useBaseFetch(`/sub-categories/${selectedCategoryId.value}`, {
            method: 'DELETE'
        });

        deleteConfirmation.value = false
        successMessage.value = message;
        loadCategories({page: 1, itemsPerPage: 10});
        successDialog.value = true;
    } catch (error) {
        console.error(error);
    }
};
</script>

<style lang="scss" scoped>
</style>
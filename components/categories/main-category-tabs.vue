<template>
	<div>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="main">
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
                            label="Search main categories"
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
                    :row-props="getItemClass"
                    :search="searchQuery"
                    @update:options="loadCategories"
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
						<v-text-field
							v-model="name.value.value"
							:error-messages="name.errorMessage.value"
							label="Name"
							variant="outlined"
						></v-text-field>
						<v-textarea
							v-model="description.value.value"
							label="Description (Optional)"
							variant="outlined"
						></v-textarea>
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
				text="Are you sure you want to delete this category?"
				title="Delete Category"
			>
				<template v-slot:actions>
					<v-btn
                        :loading="modifying"
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
import * as yup from "yup";
import debounce from "lodash/debounce";

const tab = ref("main");

const headers = ref([
	{ title: "Name", key: "name", align: "start" },
	{ title: "URL Slug", key: "url_slug", align: "start", sortable: false },
	{ title: "Status", key: "status", align: "start", sortable: false },
	{ title: "Actions", key: "actions", align: "end" },
]);

const serverItems = ref([]);
const loading = ref(true);
const modifying = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const itemDialog = ref(false);
const editDialog = ref(false);
const deleteConfirmation = ref(false);
const successDialog = ref(false);
const successMessage = ref(null);
const selectedCategoryId = ref(null);

const searchQuery = ref(null);

const schema = yup.object({
    name: yup.string().required("Name is required."),
	status: yup.string().required("Status is required."),
});

const { handleSubmit, handleReset } = useForm({
	validationSchema: schema,
    initialValues: {
        status: "Active"
    },
});

const name = useField("name");
const description = useField("description");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

const loadCategories = debounce(async ({ page, itemsPerPage, sortBy, search }) => {
    try {
        loading.value = true;

        const { data, total } = await useBaseFetch('/admin/main-categories', {
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

const resetValues = () => {
    itemDialog.value = false;
    editDialog.value = false;
    handleReset()
}

const handleFormSubmission = handleSubmit(async (values) => {
    const { $slugify } = useNuxtApp();
    
    values.urlSlug = $slugify(values.name);
    
    if (!editDialog.value) {
        addCategory(values);
    } else {
        updateCategory(values);
    }
});

const addCategory = async (values) => {
	try {
        modifying.value = true;
        const { message } = await useBaseFetch('/admin/main-categories', {
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
    } finally {
        modifying.value = false;
    }
};

const setItemToEdit = (item) => {
    editDialog.value = true;
    itemDialog.value = true;

    selectedCategoryId.value = item.id
    name.value.value = item.name;
    description.value.value = item.description;
    status.value.value = item.status;
}

const updateCategory = async (values) => {
	try {
        modifying.value = true;
        const { message } = await useBaseFetch(`/admin/main-categories/${selectedCategoryId.value}`, {
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
    } finally {
        modifying.value = false;
    }
};

const deleteCategory = async () => {
	try {
        modifying.value = true;
        const { message } = await useBaseFetch(`/admin/main-categories/${selectedCategoryId.value}`, {
            method: 'DELETE'
        });

        deleteConfirmation.value = false
        successMessage.value = message;
        loadCategories({page: 1, itemsPerPage: 10});
        successDialog.value = true;
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
};

const getItemClass = (item) => {
    if (item.item.id === selectedCategoryId.value) {
        return { class: 'bg-red-lighten-1' };
    }

    return {};
}
</script>

<style lang="scss" scoped>
</style>
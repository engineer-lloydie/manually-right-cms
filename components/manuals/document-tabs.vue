<template>
	<div>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="document">
                <v-btn
                    color="red-lighten-1"
                    @click="itemDialog = true"
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
                    @update:options="loadDocumentFiles"
                >
                    <template #item.title="{ item }">
                        <p>{{ item.title ?? 'N/A' }}</p>
                    </template>
                    <template #item.actions="{ item }">
                        <v-icon 
                            size="small" 
                            @click="deleteConfirmation = true; selectedDocumentId = item.id"
                        >
                            mdi-delete
                        </v-icon>
                        <v-icon 
                            size="small" 
                            @click="previewDocument(item.id)"
                        >
                            mdi-image-search
                        </v-icon>
                    </template>
                </v-data-table-server>
            </v-tabs-window-item>
        </v-tabs-window>

        <!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card title="Add document file">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
						@click="resetValues"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="addDocumentFile">
						<v-text-field
							v-model="title.value.value"
							:error-messages="title.errorMessage.value"
							label="Title (Optional)"
							variant="outlined"
						></v-text-field>
						<v-file-input
							label="File/Document"
							variant="outlined"
                            @change="handleFileChange"
                            prepend-icon=""
                            :error-messages="document.errorMessage.value"
                            show-size
						></v-file-input>
						<v-select
							v-model="status.value.value"
							:error-messages="status.errorMessage.value"
							:items="statusItems"
							label="Status"
							variant="outlined"
						></v-select>

                        <v-alert
                            v-if="errorMessage"
                            density="compact"
                            :text="errorMessage"
                            type="error"
                            closable
                        ></v-alert>

						<v-btn class="me-4 mt-4" type="submit" :loading="modifying"> submit </v-btn>

						<v-btn class="mt-4" @click="handleReset"> clear </v-btn>
					</form>
				</v-container>
			</v-card>
		</v-dialog>

		<v-dialog v-model="deleteConfirmation" width="auto">
			<v-card
				max-width="400"
				prepend-icon="mdi-delete-circle"
				text="Are you sure you want to delete this document file?"
				title="Delete document file"
			>
				<template v-slot:actions>
					<v-btn
						class="ms-auto"
						text="Yes"
                        color="error"
						@click="deleteDocumentFile"
                        :loading="modifying"
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

        <v-dialog
            v-model="previewDialog"
            width="100%"
            height="100%"
        >
            <v-card
                title="Preview pdf file"
            >
                <v-card-text>
                    <p class="loading-position" v-if="fetchingFile">Loading...</p>
                    <iframe v-else width="100%" height="100%" :src="documentFile"></iframe>
                </v-card-text>
                <template v-slot:actions>
                    <v-btn
                        class="ms-auto"
                        text="Ok"
                        @click="previewDialog = false"
                    ></v-btn>
                </template>
            </v-card>
        </v-dialog>
	</div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
const tab = ref("document");
import * as yup from "yup";
import { set } from "~/node_modules/nuxt/dist/app/compat/capi";

const route = useRoute();

const headers = ref([
    { title: "Title", key: "title", align: "start" },
	{ title: "Filename", key: "filename", align: "start", sortable: false },
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
const selectedDocumentId = ref(null);
const modifying = ref(false);

const errorMessage = ref(null);

const previewDialog = ref(false);
const documentFile = ref('')
const fetchingFile = ref(false);

const schema = yup.object({
	document: yup
		.mixed()
		.test("fileRequired", "Document file is required.", (value) => value && value.length > 0)
		.test("fileType", "Only PDF files are allowed.", (value) => {
			if (!value?.length) return true;
			return ["application/pdf"].includes(value[0].type);
		}),
	status: yup.string().required("Status is required."),
});

// Use Form with Validation Schema
const { handleSubmit, handleReset } = useForm({
	validationSchema: schema,
    initialValues: {
		status: "Active", // Set default value here
	},
});

// Handle File Selection
const handleFileChange = (event) => {
	const file = event.target.files || event;
	document.value.value = file;
};

const title = useField("title");
const document = useField("document");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

const loadDocumentFiles = async ({ page, itemsPerPage, sortBy }) => {
    try {
        loading.value = true;
        const { data, total } = await useBaseFetch(`/admin/manuals/${route.params.id}/files`, {
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

const resetValues = () => {
    itemDialog.value = false;
    editDialog.value = false;
    handleReset()
}

const addDocumentFile = handleSubmit(async (values) => {
    try {
        modifying.value = true;
        const formData = new FormData();
        if (values.title) {
            formData.append("title", values.title);
        }

        formData.append("status", values.status);
        
        if (values.document && values.document.length) {
            formData.append("document", values.document[0]);
        }

        const { message } = await useBaseFetch(`/admin/manuals/${route.params.id}/files`, {
            method: 'POST',
            body: formData
        });

        itemDialog.value = false
        successMessage.value = message;
        loadDocumentFiles({page: 1, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
        errorMessage.value = error?.response?.data?.message ?? error.message;
        setTimeout(() => {
            errorMessage.value = null;
        }, 5000);
    } finally {
        modifying.value = false;
    }
});

const deleteDocumentFile = async () => {
	try {
        modifying.value = true;

        const { message } = await useBaseFetch(`/admin/manuals/${route.params.id}/files/${selectedDocumentId.value}`, {
            method: 'DELETE'
        });

        deleteConfirmation.value = false
        successMessage.value = message;
        loadDocumentFiles({page: 1, itemsPerPage: 10});
        successDialog.value = true;
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
};

const previewDocument = async (id) => {
    try {
        previewDialog.value = true;
        fetchingFile.value = true;

        const { url } = await useBaseFetch(`/admin/manuals/file-signed-url/${id}?path=files`, {
            method: 'GET'
        });

        documentFile.value = url;
    } catch (error) {
        console.error(error);
    } finally {
        fetchingFile.value = false;
    }
}
</script>

<style lang="scss" scoped>
.loading-position {
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>
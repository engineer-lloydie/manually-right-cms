<template>
	<div>
        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="main">
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
                    @update:options="loadItems"
                >
                    <template #item.actions="{ item }">
                        <v-icon
                            class="me-2"
                            size="small"
                            @click="itemDialog = true"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon size="small" @click="deleteConfirmation = true"> mdi-delete </v-icon>
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
						@click="itemDialog = false"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="submit">
						<v-text-field
							v-model="title.value.value"
							:counter="10"
							:error-messages="title.errorMessage.value"
							label="Title"
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
						@click="deleteConfirmation = false"
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


const documents = [
    {
        title: "The Great Gatsby",
        file_name: "great_gatsby.pdf",
        status: "active",
    },
    {
        title: "To Kill a Mockingbird",
        file_name: "to_kill_a_mockingbird.pdf",
        status: "active",
    },
    {
        title: "1984",
        file_name: "1984.pdf",
        status: "active",
    },
    {
        title: "Pride and Prejudice",
        file_name: "pride_and_prejudice.pdf",
        status: "active",
    },
    {
        title: "The Catcher in the Rye",
        file_name: "catcher_in_the_rye.pdf",
        status: "active",
    },
    {
        title: "The Hobbit",
        file_name: "the_hobbit.pdf",
        status: "active",
    },
    {
        title: "Moby Dick",
        file_name: "moby_dick.pdf",
        status: "active",
    },
    {
        title: "War and Peace",
        file_name: "war_and_peace.pdf",
        status: "active",
    },
    {
        title: "The Odyssey",
        file_name: "the_odyssey.pdf",
        status: "active",
    },
    {
        title: "Crime and Punishment",
        file_name: "crime_and_punishment.pdf",
        status: "active",
    },
];

const FakeAPI = {
	async fetch({ page, itemsPerPage, sortBy }) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const start = (page - 1) * itemsPerPage;
				const end = start + itemsPerPage;
				const items = documents.slice();

				if (sortBy.length) {
					const sortKey = sortBy[0].key;
					const sortOrder = sortBy[0].order;
					items.sort((a, b) => {
						const aValue = a[sortKey];
						const bValue = b[sortKey];
						return sortOrder === "desc"
							? bValue - aValue
							: aValue - bValue;
					});
				}

				const paginated = items.slice(start, end);

				resolve({ items: paginated, total: items.length });
			}, 500);
		});
	},
};

const headers = ref([
    {
        title: "Title",
        align: "start",
        sortable: false,
        key: "title",
    },
    { title: "Filename", key: "file_name", align: "end" },
    { title: "Status", key: "status", align: "end" },
    { title: "Actions", key: "actions", align: "end" },
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);

const itemsPerPage = ref(5);

const loadItems = async ({ page, itemsPerPage, sortBy }) => {
	loading.value = true;
	const { items, total } = await FakeAPI.fetch({
		page,
		itemsPerPage,
		sortBy,
	});
	serverItems.value = items;
	totalItems.value = total;
	loading.value = false;
};

const itemDialog = ref(false);
const deleteConfirmation = ref(false);

const schema = yup.object({
	title: yup.string().required("Title is required."),
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

// Handle Form Submission
const submit = handleSubmit(async (values) => {
	const formData = new FormData();
	formData.append("title", values.title);
	formData.append("status", values.status);
	if (values.document && values.document.length) {
		formData.append("document", values.document[0]);
	}

    alert(1234)

	// try {
	// 	const response = await fetch("/api/upload", {
	// 		method: "POST",
	// 		body: formData,
	// 	});

	// 	const result = await response.json();
	// 	console.log("Upload Successful:", result);
	// 	alert("File uploaded successfully!");
	// } catch (error) {
	// 	console.error("Upload Error:", error);
	// 	alert("File upload failed!");
	// }
});
</script>

<style lang="scss" scoped>
</style>
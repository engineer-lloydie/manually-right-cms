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
						<v-file-input
							label="File/Document"
							variant="outlined"
                            @change="handleFileChange"
                            prepend-icon=""
                            :error-messages="thumbnail.errorMessage.value"
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


const thumbnails = [
    {
        file_name: "great_gatsby.pdf",
        status: "active",
    },
    {
        file_name: "to_kill_a_mockingbird.pdf",
        status: "active",
    },
    {
        file_name: "1984.pdf",
        status: "active",
    },
    {
        file_name: "pride_and_prejudice.pdf",
        status: "active",
    },
    {
        file_name: "catcher_in_the_rye.pdf",
        status: "active",
    },
    {
        file_name: "the_hobbit.pdf",
        status: "active",
    },
    {
        file_name: "moby_dick.pdf",
        status: "active",
    },
    {
        file_name: "war_and_peace.pdf",
        status: "active",
    },
    {
        file_name: "the_odyssey.pdf",
        status: "active",
    },
    {
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
				const items = thumbnails.slice();

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
        title: "Filename",
        align: "start",
        sortable: false,
        key: "file_name",
    },
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
	thumbnail: yup
		.mixed()
		.test("fileRequired", "Thumbnail file is required.", (value) => value && value.length > 0)
		.test("fileType", "Only PNG, JPG, or JPEG files are allowed.", (value) => {
			if (!value?.length) return true;
			return ["image/png", "image/jpg", "image/jpeg"].includes(value[0].type);
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
	thumbnail.value.value = file;
};

const thumbnail = useField("thumbnail");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

// Handle Form Submission
const submit = handleSubmit(async (values) => {
	const formData = new FormData();
	formData.append("title", values.title);
	formData.append("status", values.status);
	if (values.thumbnail && values.thumbnail.length) {
		formData.append("thumbnail", values.thumbnail[0]);
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
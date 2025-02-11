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
			<v-card title="Add subcategory">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
						@click="itemDialog = false"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="submit">
                        <v-select
							v-model="mainCategory.value.value"
							:error-messages="mainCategory.errorMessage.value"
							:items="mainCategoryLists"
							label="Main Category"
							variant="outlined"
						></v-select>
						<v-text-field
							v-model="name.value.value"
							:counter="10"
							:error-messages="name.errorMessage.value"
							label="Name"
							variant="outlined"
						></v-text-field>
						<v-text-field
							v-model="description.value.value"
							:counter="10"
							label="Description (Optional)"
							variant="outlined"
						></v-text-field>
						<v-text-field
							v-model="urlSlug.value.value"
							:counter="10"
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
						@click="deleteConfirmation = false"
					></v-btn>
				</template>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const tab = ref("main");

const subCategories = [
    {
        main_category: "Dessert",
        name: "Frozen Yogurt",
        description: 159,
        url_slug: 6.0,
        status: 24,
    },
    {
        main_category: "Candy",
        name: "Jelly bean",
        description: 375,
        url_slug: 0.0,
        status: 94,
    },
    {
        main_category: "Chocolate",
        name: "KitKat",
        description: 518,
        url_slug: 26.0,
        status: 65,
    },
    {
        main_category: "Pastry",
        name: "Eclair",
        description: 262,
        url_slug: 16.0,
        status: 23,
    },
    {
        main_category: "Cookie",
        name: "Gingerbread",
        description: 356,
        url_slug: 16.0,
        status: 49,
    },
    {
        main_category: "Dessert",
        name: "Ice cream sandwich",
        description: 237,
        url_slug: 9.0,
        status: 37,
    },
    {
        main_category: "Candy",
        name: "Lollipop",
        description: 392,
        url_slug: 0.2,
        status: 98,
    },
    {
        main_category: "Pastry",
        name: "Cupcake",
        description: 305,
        url_slug: 3.7,
        status: 67,
    },
    {
        main_category: "Candy",
        name: "Honeycomb",
        description: 408,
        url_slug: 3.2,
        status: 87,
    },
    {
        main_category: "Pastry",
        name: "Donut",
        description: 452,
        url_slug: 25.0,
        status: 51,
    },
];

const FakeAPI = {
	async fetch({ page, itemsPerPage, sortBy }) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const start = (page - 1) * itemsPerPage;
				const end = start + itemsPerPage;
				const items = subCategories.slice();

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
		title: "Main Category",
		align: "start",
        sortable: false,
		key: "main_category",
	},
	{
		title: "Name",
		align: "end",
		sortable: false,
		key: "name",
	},
	{ title: "Description", key: "description", align: "end" },
	{ title: "URL Slug", key: "url_slug", align: "end" },
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
	mainCategory: yup.string().required("Main category is required."),
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

const mainCategory = useField("mainCategory");
const name = useField("name");
const description = useField("description");
const urlSlug = useField("urlSlug");
const status = useField("status");

const statusItems = ref(["Active", "Inactive"]);
const mainCategoryLists = ref(["Main Category 1", "Main Category 2"]);

const submit = handleSubmit((values) => {
	alert(JSON.stringify(values, null, 2));
});
</script>

<style lang="scss" scoped>
</style>
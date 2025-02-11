<template>
    <div>
		<h3>Manuals</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-card-text>
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
                        <v-btn
                            size="small"
                            icon="mdi-pencil"
                            @click="itemDialog = true"
                            density="comfortable"
                            flat
                        ></v-btn>
                        <v-btn
                            size="small"
                            icon="mdi-delete" 
                            @click="deleteConfirmation = true"
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
                                    :to="`/manuals/${item.url_slug}`"
                                ></v-btn>
                            </template>
                        </v-tooltip>
                    </template>
                </v-data-table-server>
			</v-card-text>
		</v-card>

        <!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card title="Add manual">
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
							v-model="category.value.value"
							:error-messages="category.errorMessage.value"
							:items="subCategories"
							label="Category"
							variant="outlined"
						></v-select>
                        <v-text-field
							v-model="title.value.value"
							:counter="10"
							:error-messages="title.errorMessage.value"
							label="Title"
							variant="outlined"
						></v-text-field>
						<v-text-field
							v-model="description.value.value"
							:counter="10"
							label="Description (Optional)"
							variant="outlined"
						></v-text-field>
                        <v-text-field
							v-model="price.value.value"
							:counter="10"
                            :error-messages="price.errorMessage.value"
							label="Price"
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

const manuals = [
    {
        category: "Dessert",
        title: "Frozen Yogurt",
        description: 159,
        url_slug: 'dessert',
        status: 24,
        price: 120,
    },
    {
        category: "Candy",
        title: "Jelly bean",
        description: 375,
        url_slug: 'dessert',
        status: 94,
        price: 110,
    },
    {
        category: "Chocolate",
        title: "KitKat",
        description: 518,
        url_slug: 'dessert',
        status: 65,
        price: 130,
    },
    {
        category: "Pastry",
        title: "Eclair",
        description: 262,
        url_slug: 'dessert',
        status: 23,
        price: 115,
    },
    {
        category: "Cookie",
        title: "Gingerbread",
        description: 356,
        url_slug: 'dessert',
        status: 49,
        price: 125,
    },
    {
        category: "Dessert",
        title: "Ice cream sandwich",
        description: 237,
        url_slug: 'dessert',
        status: 37,
        price: 105,
    },
    {
        category: "Candy",
        title: "Lollipop",
        description: 392,
        url_slug: 'dessert',
        status: 98,
        price: 100,
    },
    {
        category: "Pastry",
        title: "Cupcake",
        description: 305,
        url_slug: 'dessert',
        status: 67,
        price: 130,
    },
    {
        category: "Candy",
        title: "Honeycomb",
        description: 408,
        url_slug: 'dessert',
        status: 87,
        price: 115,
    },
    {
        category: "Pastry",
        title: "Donut",
        description: 452,
        url_slug: 'dessert',
        status: 51,
        price: 110,
    },
];

const FakeAPI = {
	async fetch({ page, itemsPerPage, sortBy }) {
		return new Promise((resolve) => {
			setTimeout(() => {
				const start = (page - 1) * itemsPerPage;
				const end = start + itemsPerPage;
				const items = manuals.slice();

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
		title: "Category",
		align: "start",
		sortable: false,
		key: "category",
	},
	{
		title: "Title",
		align: "end",
		sortable: false,
		key: "title",
	},
	{ title: "Description", key: "description", align: "end" },
    { title: "Price", key: "price", align: "end" },
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

const { handleSubmit, handleReset } = useForm({
	validationSchema: {
        category(value) {
			if (value) return true;

			return "Category is required.";
		},
		title(value) {
			if (value) return true;

			return "Title is required.";
		},
		urlSlug(value) {
			if (value) return true;

			return "URL slug is required.";
		},
        price(value) {
            if (value) return true;

            return "Price is required.";
        },
		status(value) {
			if (value) return true;

			return "Status is required.";
		},
	},
});
const category = useField("category");
const title = useField("title");
const description = useField("description");
const price = useField("price");
const urlSlug = useField("urlSlug");
const status = useField("status");

const statusItems = ref(["Active", "Inactive"]);
const subCategories = ref(["SubCategory 1", "SubCategory 2"]);

const submit = handleSubmit((values) => {
	alert(JSON.stringify(values, null, 2));
});
</script>

<style lang="scss" scoped>

</style>
<template>
	<div>
		<h3>Banners</h3>
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
                    :expanded="expanded"
                    :items-per-page="itemsPerPage"
                    :headers="headers"
                    :items="banners"
                    :items-length="totalItems"
                    :loading="fetching"
                    @update:options="getBanners"
                >
                    <template #item.title="{ item }">
                        <p>{{ item.title ?? 'N/A' }}</p>
                    </template>
                    <template #item.actions="{ item }">
                        <v-icon 
                            size="small" 
                            @click="previewBanner(item.id)"
                        >
                            mdi-image-search
                        </v-icon>
                        <v-btn icon="mdi-delete" size="small"
                            :loading="deleting"
                            @click="deleteBanner(item.id)"
                            variant="text"
                        >
                        </v-btn>
                    </template>
                </v-data-table-server>
			</v-card-text>
		</v-card>

        <!-- Dialogs -->
		<v-dialog v-model="itemDialog" max-width="500">
			<v-card title="Add Banner">
				<template v-slot:actions>
					<v-btn
						class="ml-auto"
						text="Close"
						@click="resetValues"
					></v-btn>
				</template>
				<v-container>
					<form @submit.prevent="addBannerFile">
						<v-file-input
							label="File/Image"
							variant="outlined"
                            @change="handleFileChange"
                            prepend-icon=""
                            :error-messages="banner.errorMessage.value"
                            show-size
						></v-file-input>
						<v-select
							v-model="status.value.value"
							:error-messages="status.errorMessage.value"
							:items="statusItems"
							label="Status"
							variant="outlined"
						></v-select>

						<v-btn class="me-4 mt-4" type="submit" :loading="modifying"> submit </v-btn>

						<v-btn class="mt-4" @click="handleReset"> clear </v-btn>
					</form>
				</v-container>
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
            width="600"
            height="610"
        >
            <v-card
                title="Preview thumbnail"
            >
                <v-card-text>
                    <p class="loading-position" v-if="fetchingFile">Loading...</p>
                    <v-img v-else width="auto" lazy-src="~/assets/images/image-icon.png" :src="bannerImage">
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular
                                    color="grey-lighten-4"
                                    indeterminate
                                ></v-progress-circular>
                            </div>
                        </template>
                    </v-img>
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
import * as yup from "yup";

const banners = ref([]);
const fetching = ref(false);
const modifying = ref(false);
const deleting = ref(false);

// For table setup
const headers = ref([
    { title: "Title", key: "title", align: "start" },
    { title: "Filename", key: "filename", align: "end" },
    { title: "Status", key: "status", align: "end" },
    { title: "Actions", key: "actions", align: "end" }
]);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const expanded = ref([]);
const currentPage = ref(1);

const previewDialog = ref(false);
const bannerImage = ref('')
const fetchingFile = ref(false);

const itemDialog = ref(false);
const successDialog = ref(false);

const successMessage = ref(null);

const schema = yup.object({
	banner: yup
		.mixed()
		.test("fileRequired", "Banner file is required.", (value) => value && value.length > 0)
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
	banner.value.value = file;
};

const banner = useField("banner");
const status = useField("status");
const statusItems = ref(["Active", "Inactive"]);

const getBanners = async ({ page, itemsPerPage, sortBy }) => {
    try {
        fetching.value = true;
        currentPage.value = page;
        
        const { data, total } = await useBaseFetch('/banners', {
            method: 'get',
            params: {
                page,
                itemsPerPage,
                sortBy
            }
        })

        banners.value = data;
        totalItems.value = total
    } catch (error) {
        console.error(error);
    } finally {
        fetching.value = false;
    }
}

const resetValues = () => {
    itemDialog.value = false;
    handleReset()
}

const addBannerFile = handleSubmit(async (values) => {
    try {
        modifying.value = true;
        const formData = new FormData();
        formData.append("status", values.status);
        if (values.banner && values.banner.length) {
            formData.append("banner", values.banner[0]);
        }

        const { message } = await useBaseFetch(`/banners`, {
            method: 'POST',
            body: formData
        });

        itemDialog.value = false
        successMessage.value = message;
        getBanners({page: 1, itemsPerPage: 10});
        successDialog.value = true;
        handleReset();
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
});

const deleteBanner = async (bannerId) => {
	try {
        deleting.value = true;

        const { message } = await useBaseFetch(`/banners/${bannerId}`, {
            method: 'DELETE'
        });

        successMessage.value = message;
        getBanners({page: 1, itemsPerPage: 10});
        successDialog.value = true;
    } catch (error) {
        console.error(error);
    } finally {
        deleting.value = false;
    }
};

const previewBanner = async (id) => {
    try {
        previewDialog.value = true;
        fetchingFile.value = true;

        const { bannerUrl } = await useBaseFetch(`/banners/${id}/preview`, {
            method: 'GET'
        });

        bannerImage.value = bannerUrl;
    } catch (error) {
        console.error(error);
    } finally {
        fetchingFile.value = false;
    }
}
</script>

<style lang="scss" scoped>
</style>
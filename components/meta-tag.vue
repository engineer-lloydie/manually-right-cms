<template>
    <div>
        <v-container>
            <form @submit.prevent="handleMetaTagForm">
                <v-text-field
                    v-model="metaTitle.value.value"
                    :error-messages="metaTitle.errorMessage.value"
                    label="Title"
                    variant="outlined"
                ></v-text-field>
                <v-textarea
                    v-model="metaDescription.value.value"
                    :error-messages="metaDescription.errorMessage.value"
                    label="Description"
                    variant="outlined"
                ></v-textarea>

                <v-btn class="me-4 mt-4" :loading="modifying" type="submit"> submit </v-btn>

                <v-btn class="mt-4" @click="handleReset"> clear </v-btn>
            </form>
        </v-container>
    </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    model: {
        type: String,
        default: 'site_page'
    }
});

const emit = defineEmits(['success']);

const selectedItemId = ref(null);
const modifying = ref(false);

const schema = yup.object({
    metaTitle: yup.string().required("Meta tag title is required."),
    metaDescription: yup.string().required("Meta tag description is required.")
});

const { handleSubmit, handleReset } = useForm({
	validationSchema: schema
});

// Meta Tag Form Fields
const metaTitle = useField("metaTitle");
const metaDescription = useField("metaDescription");

selectedItemId.value = props.item?.id
metaTitle.value.value = props.item?.meta_tags?.title ?? null;
metaDescription.value.value = props.item?.meta_tags?.description ?? null;

const handleMetaTagForm = handleSubmit(async (values) => {
    try {
        values.model = props.model;
        modifying.value = true;
        const { message } = await useBaseFetch(`/admin/meta-tags/${selectedItemId.value}`, {
            method: props.item?.meta_tags ? 'PUT' : 'POST',
            body: values
        });

        emit('success', message);
    } catch (error) {
        console.error(error);
    } finally {
        modifying.value = false;
    }
})
</script>

<style lang="scss" scoped>

</style>
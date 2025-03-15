<template>
	<div>
		<h3>Manuals Documents and Thumbnails</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-tabs v-model="tab" bg-color="grey-lighten-1" :mobile="false">
				<v-tab value="document">Documents</v-tab>
				<v-tab value="thumbnail">Thumbnails</v-tab>
			</v-tabs>

			<v-card-text>
				<DocumentTabs v-if="tab == 'document'"/>
                <ThumbnailTabs v-else/>
			</v-card-text>
		</v-card>
	</div>
</template>

<script setup>
import DocumentTabs from '~/components/manuals/document-tabs.vue';
import ThumbnailTabs from '~/components/manuals/thumbnail-tabs.vue';

definePageMeta({
    title: 'Manuals'
});

const tab = ref('document');
</script>

<style lang="scss" scoped>
</style>
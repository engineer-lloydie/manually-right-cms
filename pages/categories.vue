<template>
	<div>
		<h3>Categories</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-tabs v-model="tab" bg-color="grey-lighten-1" :mobile="false">
				<v-tab value="main">Main Categories</v-tab>
				<v-tab value="sub">SubCategories</v-tab>
			</v-tabs>

			<v-card-text>
				<MainCategoryTabs v-if="tab == 'main'"/>
                <SubCategoryTabs v-else/>
			</v-card-text>
		</v-card>
	</div>
</template>

<script setup>
import MainCategoryTabs from '~/components/categories/main-category-tabs.vue';
import SubCategoryTabs from '~/components/categories/subcategory-tabs.vue';

definePageMeta({
    title: 'Categories'
});

const tab = ref('main');
</script>

<style lang="scss" scoped>
</style>
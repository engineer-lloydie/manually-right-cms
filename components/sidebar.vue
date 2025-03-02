<template>
	<v-card>
		<v-layout>
			<v-navigation-drawer
				v-model="drawer"
				:rail="rail"
				@click="rail = false"
                :mobile="false"
                absolute
			>
				<v-list-item
					title="Manually Right"
				>
					<template v-slot:append>
						<v-btn
							:icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
							variant="text"
							@click.stop="rail = !rail"
						></v-btn>
					</template>
				</v-list-item>

				<v-divider></v-divider>

				<v-list density="compact" nav>
					<v-list-item
						prepend-icon="mdi-home-city"
						title="Dashboard"
                        exact
						to="/"
					></v-list-item>
					<v-list-item
						prepend-icon="mdi-list-box"
						title="Categories"
                        exact
						to="/categories"
					></v-list-item>
                    <v-list-item
						prepend-icon="mdi-file-document-multiple"
						title="Manuals"
                        exact
                        to="/manuals"
					></v-list-item>
                    <v-list-item
						prepend-icon="mdi-invoice-list"
						title="Orders"
                        exact
                        to="/orders"
					></v-list-item>
                    <v-list-item
						prepend-icon="mdi-view-carousel"
						title="Banners"
                        exact
                        to="/banners"
					></v-list-item>
				</v-list>
			</v-navigation-drawer>
			<v-main>
                <v-container>
                    <slot name="main"/>
                </v-container>
            </v-main>
		</v-layout>
	</v-card>
</template>

<script setup>
const drawer = ref(true);
const rail = ref(false);
</script>
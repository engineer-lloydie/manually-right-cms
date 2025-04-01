<template>
	<div>
		<h3>Orders</h3>
		<v-divider class="my-5"></v-divider>
		<v-card>
			<v-card-text>
                <v-data-table-server
                    :expanded="expanded"
                    :items-per-page="itemsPerPage"
                    :items-per-page-options="[5, 10, 25, 50]"
                    :headers="headers"
                    :items="ordersLists"
                    :items-length="totalItems"
                    :loading="fetching"
                    item-value="order_number"
                    show-expand
                    @update:options="getOrderLists"
                >
                    <template v-slot:item.order_number="{ value }">
                        <p class="font-weight-bold">{{ value }}</p>
                    </template>
                    <template v-slot:item.payment_status="{ value }">
                        <p class="font-weight-bold text-success">{{ value.toUpperCase() }}</p>
                    </template>
                    <template v-slot:expanded-row="{ item }">
                        <tr class="bg-red-lighten-2">
                            <th colspan="2">Name</th>
                            <th>Total Price</th>
                            <th>Quantity</th>
                            <th>Download Previlige</th>
                        </tr>
                        <tr class="bg-grey-lighten-2" v-for="cart in item.carts" :key="cart.id">
                            <td colspan="2">{{ cart.manual.title }}</td>
                            <td>{{ cart.price }}</td>
                            <td>{{ cart.quantity }}</td>
                            <td>{{ item.order_details.download_count }}</td>
                            <!-- <td>
                                <v-tooltip text="Download Manual Files">
                                    <template v-slot:activator="{ props }">
                                        <v-btn @click="downloadFiles(item, cart)" :loading="isDownloading" :disabled="item.order_details.download_count == 0" variant="text" icon="mdi-file-download" v-bind="props"></v-btn>
                                    </template>
                                </v-tooltip>
                            </td> -->
                        </tr>
                    </template>
                </v-data-table-server>
			</v-card-text>
		</v-card>
	</div>
</template>

<script setup>
definePageMeta({
    title: 'Orders'
});

const ordersLists = ref([]);
const fetching = ref(false);

// For table setup
const headers = ref([
    { title: "Order No.", key: "order_number", align: "start" },
    { title: "Transaction ID.", key: "transaction_id", align: "end" },
    { title: "Order Date", key: "purchase_date", align: "end" },
    { title: "Total Price", key: "total_price", align: "end" },
	{ title: "Order Status", key: "payment_status", align: "end", sortable: false }
]);
const itemsPerPage = ref(5);
const totalItems = ref(0);
const expanded = ref([]);
const currentPage = ref(1);

const getOrderLists = async ({ page, itemsPerPage, sortBy }) => {
    try {
        fetching.value = true;
        currentPage.value = page;
        
        const { data, total } = await useBaseFetch('/admin/orders/lists', {
            method: 'get',
            params: {
                page,
                itemsPerPage,
                sortBy
            }
        })

        ordersLists.value = data;
        totalItems.value = total
    } catch (error) {
        console.error(error);
    } finally {
        fetching.value = false;
    }
}
</script>

<style lang="scss" scoped>
</style>
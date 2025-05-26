<template>
	<div>
		<h3>Dashboard</h3>
		<v-divider class="my-5"></v-divider>
		<v-sheet class="pa-5">
            <v-row>
                <v-col cols="8">
                    <v-card>
                        <v-card-text>
                            <v-sheet v-if="salesTodayLoading || appSummaryLoading || orderHistoryLoading"
                                class="d-flex align-center justify-center"
                                style="height: 200px;"
                            >
                                <v-progress-circular
                                    indeterminate
                                    color="primary"
                                    size="50"
                                    width="5"
                                    class="text-center"
                                ></v-progress-circular>
                            </v-sheet>
                            <v-sheet v-else>
                                <h2 class="mb-10 text-center">Sales Today: <span class="text-red-lighten-1">${{ salesToday }}</span></h2>
                                <v-sheet class="d-flex align-center justify-space-around">
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <v-icon
                                                color="white"
                                                size="30"
                                                class="mr-5 pa-7 bg-red-lighten-3 rounded"
                                            >
                                                mdi-account-group
                                            </v-icon>
                                        </div>
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Total Users</h4>
                                            <p class="font-weight-bold text-h6">{{ appSummary.total_users }}</p>
                                        </div>
                                    </div>
            
                                    <v-divider vertical></v-divider>
            
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <v-icon
                                                color="white"
                                                size="30"
                                                class="mr-5 pa-7 bg-blue-lighten-3 rounded"
                                            >
                                                mdi-cart-variant
                                            </v-icon>
                                        </div>
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Total Orders</h4>
                                            <p class="font-weight-bold text-h6">{{ appSummary.total_orders }}</p>
                                        </div>
                                    </div>
            
                                    <v-divider vertical></v-divider>
    
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <v-icon
                                                color="white"
                                                size="30"
                                                class="mr-5 pa-7 bg-green-lighten-3 rounded"
                                            >
                                                mdi-invoice
                                            </v-icon>
                                        </div>
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Total Sales</h4>
                                            <p class="font-weight-bold text-h6">${{ appSummary.total_sales }}</p>
                                        </div>
                                    </div>
                                </v-sheet>
    
                                <v-divider class="my-10"></v-divider>
    
                                <v-sheet class="d-flex align-center justify-space-around">
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Orders Today</h4>
                                            <p class="font-weight-bold text-h6">{{ orderHistory.today }}</p>
                                        </div>
                                    </div>
            
                                    <v-divider vertical></v-divider>
            
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Orders This Week</h4>
                                            <p class="font-weight-bold text-h6">{{ orderHistory.this_week }}</p>
                                        </div>
                                    </div>
            
                                    <v-divider vertical></v-divider>
    
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Orders This Month</h4>
                                            <p class="font-weight-bold text-h6">{{ orderHistory.this_month }}</p>
                                        </div>
                                    </div>
    
                                    <v-divider vertical></v-divider>
    
                                    <div class="d-flex align-center mx-5">
                                        <div>
                                            <h4 class="mb-2 font-weight-regular">Orders Last Month</h4>
                                            <p class="font-weight-bold text-h6">{{ orderHistory.last_month }}</p>
                                        </div>
                                    </div>
                                </v-sheet>

                            </v-sheet>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="4">
                    <v-sheet>
                        <v-card>
                            <v-card-text>
                                <h2>Top Selling Products</h2>

                                <v-sheet v-if="topSellingLoading"
                                    class="d-flex align-center justify-center"
                                    style="height: 200px;"
                                >
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                        size="50"
                                        width="5"
                                        class="text-center"
                                    ></v-progress-circular>
                                </v-sheet>

                                <v-sheet v-else>
                                    <v-sheet height="20"></v-sheet>
                                    <div v-for="(item, index) in topSelling" :key="item.manual_id">
                                        <v-sheet class="d-flex align-center justify-space-around">
                                            <div class="w-75">
                                                <h4>{{ item.manual_title }}</h4>
                                                <p>Total Quantity: {{ item.total_orders }}</p>
                                            </div>
                                            <div>
                                                <h4 class="text-red-lighten-1">${{ item.total_price }}</h4>
                                                <p>Total Revenue</p>
                                            </div>
                                        </v-sheet>
        
                                        <v-divider v-if="(index + 1) < topSelling.length" class="my-5"></v-divider>
                                    </div>
                                </v-sheet>
                            </v-card-text>
                        </v-card>
                    </v-sheet>
                </v-col>
            </v-row>
		</v-sheet>
	</div>
</template>

<script setup>
definePageMeta({
    title: 'Dashboard'
});

const topSelling = ref(null);
const topSellingLoading = ref(true);

const salesToday = ref(0);
const salesTodayLoading = ref(true);

const appSummary = ref(null);
const appSummaryLoading = ref(true);

const orderHistory = ref(null);
const orderHistoryLoading = ref(true);

const fetchTopSelling = async () => {
    try {
        topSellingLoading.value = true;
        const { data } = await useBaseFetch('/admin/dashboard/top-selling-manuals', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        topSelling.value = data;
    } catch (error) {
        console.error('Error fetching top selling products:', error);
    } finally {
        topSellingLoading.value = false;
    }
}

const fetchTodaysSales = async () => {
    try {
        salesTodayLoading.value = true;
        const { data } = await useBaseFetch('/admin/dashboard/sales-today', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        salesToday.value = data;
    } catch (error) {
        console.error('Error fetching total sales today:', error);
    } finally {
        salesTodayLoading.value = false;
    }
}

const fetchAppSummary = async () => {
    try {
        appSummaryLoading.value = true;
        const { data } = await useBaseFetch('/admin/dashboard/app-summary', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        appSummary.value = data;
    } catch (error) {
        console.error('Error fetching app summary:', error);
    } finally {
        appSummaryLoading.value = false;
    }
}

const fetchOrderHistory = async () => {
    try {
        orderHistoryLoading.value = true;
        const { data } = await useBaseFetch('/admin/dashboard/order-history', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        orderHistory.value = data;
    } catch (error) {
        console.error('Error fetching order-history:', error);
    } finally {
        orderHistoryLoading.value = false;
    }
}

onMounted(() =>{
    fetchTopSelling();
    fetchTodaysSales();
    fetchAppSummary();
    fetchOrderHistory();
});

</script>

<style lang="scss" scoped>
</style>
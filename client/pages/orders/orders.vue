<template>
	<view>
		<view class="header-bar">
			<text class="page-title">我的订单</text>
			<button class="export-btn" size="mini" @click="exportData">导出CSV</button>
		</view>
		<product-list :products="orderProducts" title="我的订单"></product-list>
	</view>
</template>

<script>
	import request from '@/utils/request.js';
	import { downloadFile } from '@/utils/downloader.js';
	export default {
		data() {
			return { orderProducts: [] };
		},
		onShow() { this.fetchOrders(); },
		methods: {
			async fetchOrders() {
				try {
					const orders = await request({ url: '/user/orders' });
					// API返回的是订单列表，需要提取其中的商品信息
					this.orderProducts = orders.map(order => order.product);
				} catch (e) { uni.showToast({ title: '加载失败', icon: 'none' }); }
			},
			// 导出方法
			exportData() {
				downloadFile('/user/export/orders', 'my_orders.csv');
			}
		}
	}
</script>

<style>
/* 页面头部样式 */
.header-bar { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; }
.page-title { font-size: 32rpx; font-weight: bold; }
.export-btn { background-color: #19be6b; color: white; }
</style>



<template>
	<view class="content">
		<!-- 搜索框 -->
		<input class="search-bar" @confirm="onSearch" placeholder="搜索商品标题" v-model="searchValue" />
		
		<!-- 加载中提示 -->
		<view v-if="loading" class="empty-container">
			<text>正在加载中...</text>
		</view>

		<!-- 商品列表 -->
		<view v-else-if="products.length > 0" class="product-list">
			<view class="product-item" v-for="product in products" :key="product._id" @click="goToDetail(product._id)">
				<image class="product-image" :src="getProductImageUrl(product._id)"></image>
				<view class="product-info">
					<text class="product-title">{{ product.title }}</text>
					<text class="product-price">¥{{ product.price }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态提示 -->
		<view v-else class="empty-container">
			<image class="empty-image" src="/static/empty.png"></image>
			<text class="empty-text">市场空空如也，快来发布你的第一件商品吧！</text>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js';
	import { BASE_URL } from '@/utils/request.js'; // 导入 BASE_URL

	export default {
		data() {
			return {
				products: [],
				searchValue: '',
				loading: true // 新增一个加载状态
			}
		},
		// onShow 会在每次页面显示时触发，比 onLoad 更适合刷新列表
		onShow() {
			this.fetchProducts();
		},
		methods: {
			async fetchProducts(search = '') {
				this.loading = true; // 开始加载
				try {
					const data = await request({
						url: `/products?search=${search}`,
						method: 'GET'
					});
					this.products = data;
				} catch (error) {
					console.error(error);
				} finally {
					this.loading = false; // 加载结束
				}
			},
			onSearch(event) {
				this.fetchProducts(event.detail.value);
			},
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${id}`
				});
			},
			getProductImageUrl(id) {
				// 拼接出完整的图片请求 URL
				return `${BASE_URL}/products/${id}/image`;
			},
		}
	}
</script>

<style>
/* 简单样式 */
.search-bar { border: 1px solid #ccc; padding: 10rpx; margin: 20rpx; border-radius: 30rpx; background: #fff; }
.product-list { padding: 0 20rpx; }
.product-item { display: flex; padding: 20rpx; margin-bottom: 20rpx; background: #fff; border-radius: 10rpx; }
.product-image { width: 150rpx; height: 150rpx; margin-right: 20rpx; border-radius: 10rpx; }
.product-info { display: flex; flex-direction: column; justify-content: space-between; }
.product-price { color: red; margin-top: 10rpx; font-weight: bold; }
/* 空状态样式 */
.empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
	color: #999;
}
.empty-image {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 20rpx;
}
</style>


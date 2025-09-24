<template>
	<view class="content">
		<!-- 搜索框 -->
		<input class="search-bar" @confirm="onSearch" placeholder="搜索商品标题" />
		
		<!-- 商品列表 -->
		<view class="product-list">
			<view class="product-item" v-for="product in products" :key="product._id" @click="goToDetail(product._id)">
				<image class="product-image" :src="product.imageUrl"></image>
				<view class="product-info">
					<text class="product-title">{{ product.title }}</text>
					<text class="product-price">¥{{ product.price }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				products: []
			}
		},
		onLoad() {
			this.fetchProducts();
		},
		methods: {
			async fetchProducts(search = '') {
				try {
					const data = await request({
						url: `/products?search=${search}`,
						method: 'GET'
					});
					this.products = data;
				} catch (error) {
					console.error(error);
				}
			},
			onSearch(event) {
				this.fetchProducts(event.detail.value);
			},
			goToDetail(id) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${id}`
				});
			}
		}
	}
</script>

<style>
/* 简单样式 */
.search-bar { border: 1px solid #ccc; padding: 10rpx; margin: 20rpx; }
.product-item { display: flex; padding: 20rpx; border-bottom: 1px solid #eee; }
.product-image { width: 150rpx; height: 150rpx; margin-right: 20rpx; }
.product-info { display: flex; flex-direction: column; }
.product-price { color: red; margin-top: 10rpx; }
</style>
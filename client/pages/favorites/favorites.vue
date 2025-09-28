<template>
	<view>
		<!-- 列表组件，传入不同的数据和标题 -->
		<product-list :products="products" title="我的收藏"></product-list>
	</view>
</template>
<script>
	import request from '@/utils/request.js';
	// import productList from '@/components/product-list.vue'; // 引入通用列表组件
	export default {
		// components: { productList },
		data() {
			return { products: [] };
		},
		onShow() { this.fetchFavorites(); },
		methods: {
			async fetchFavorites() {
				try {
					this.products = await request({ url: '/user/favorites' });
				} catch (e) { uni.showToast({ title: '加载失败', icon: 'none' }); }
			}
		}
	}
</script>


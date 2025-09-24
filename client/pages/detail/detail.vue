<template>
	<view class="container" v-if="product">
		<image class="product-image-detail" :src="getProductImageUrl(productId)" mode="widthFix"></image>
		<view class="product-card">
			<text class="price">¥{{ product.price }}</text>
			<text class="title">{{ product.title }}</text>
			<text class="description">{{ product.description }}</text>
			<view class="owner-info">
				<text>发布者: {{ product.owner.nickname }}</text>
			</view>
			<button class="favorite-btn" @click="favoriteProduct">
				{{ isFavorited ? '取消收藏' : '收藏' }}
			</button>
		</view>

		<view class="comments-section">
			<text class="section-title">留言区</text>
			<view class="comment-item" v-for="comment in product.comments" :key="comment._id">
				<text class="comment-user">{{ comment.nickname }}:</text>
				<text class="comment-content">{{ comment.content }}</text>
			</view>
			<view class="comment-form">
				<input v-model="commentContent" placeholder="发表你的留言..." />
				<button @click="addComment">提交</button>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js';
	import { mapState } from 'vuex';

	export default {
		data() {
			return {
				productId: null,
				product: null,
				commentContent: ''
			};
		},
		computed: {
			...mapState(['userInfo']),
			isFavorited() {
				if (this.product && this.userInfo) {
					return this.product.favoritedBy.includes(this.userInfo.id);
				}
				return false;
			}
		},
		onLoad(options) {
			this.productId = options.id;
			this.fetchProductDetail();
		},
		methods: {
			async fetchProductDetail() {
				try {
					const data = await request({
						url: `/products/${this.productId}`,
						method: 'GET'
					});
					this.product = data;
				} catch (error) {
					uni.showToast({ title: '加载失败', icon: 'none' });
				}
			},
			async addComment() {
				if (!this.$store.state.token) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					return;
				}
				if (!this.commentContent) {
					uni.showToast({ title: '留言不能为空', icon: 'none' });
					return;
				}
				try {
					await request({
						url: `/products/${this.productId}/comments`,
						method: 'POST',
						data: { content: this.commentContent }
					});
					this.commentContent = '';
					uni.showToast({ title: '留言成功' });
					this.fetchProductDetail(); // 重新加载数据
				} catch (error) {
					uni.showToast({ title: '留言失败', icon: 'none' });
				}
			},
			async favoriteProduct() {
				if (!this.$store.state.token) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					return;
				}
				try {
					await request({
						url: `/products/${this.productId}/favorite`,
						method: 'POST'
					});
					this.fetchProductDetail(); // 重新加载以更新收藏状态
				} catch (error) {
					uni.showToast({ title: '操作失败', icon: 'none' });
				}
			},
			getProductImageUrl(id) {
				// 拼接出完整的图片请求 URL
				return `${BASE_URL}/products/${id}/image`;
			},
		}
	};
</script>

<style>
/* 样式 */
.product-image-detail { width: 100%; }
.product-card { background: #fff; padding: 20rpx; margin-top: -10rpx; }
.price { color: red; font-size: 40rpx; font-weight: bold; }
.title { font-size: 32rpx; display: block; margin: 10rpx 0; }
.favorite-btn { margin-top: 20rpx; }
.comments-section { background: #fff; margin-top: 20rpx; padding: 20rpx; }
.section-title { font-weight: bold; display: block; margin-bottom: 20rpx; }
.comment-item { border-bottom: 1px solid #eee; padding: 10rpx 0; }
.comment-user { font-weight: bold; margin-right: 10rpx; }
.comment-form { display: flex; margin-top: 20rpx; }
</style>
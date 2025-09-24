<template>
	<view class="container">
		<view class="form-card">
			<input class="form-input" v-model="formData.title" placeholder="商品标题" />
			<textarea class="form-textarea" v-model="formData.description" placeholder="商品描述..."></textarea>
			<input class="form-input" v-model="formData.price" type="number" placeholder="价格" />
			<input class="form-input" v-model="formData.category" placeholder="分类 (如图书、电子产品)" />
			
			<!-- 图片输入区 -->
			<view class="image-section-title">图片信息 (URL和Base64至少填一项)</view>
			<input class="form-input" v-model="formData.imageUrl" placeholder="粘贴图片URL" />
			<textarea class="form-textarea" v-model="formData.imageBase64" placeholder="或 粘贴图片的Base64码"></textarea>

			<button class="submit-btn" @click="submitForm">确认发布</button>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	export default {
		data() {
			return {
				formData: {
					title: '',
					description: '',
					price: null,
					category: '',
					imageUrl: '',
					imageBase64: '' // 新增字段
				}
			};
		},
		onShow() {
			if (!this.$store.state.token) {
				uni.showToast({ title: '请先登录', icon: 'none', duration: 2000 });
				setTimeout(() => { uni.switchTab({ url: '/pages/my/my' }); }, 2000);
			}
		},
		methods: {
			async submitForm() {
				// 基础信息校验
				const requiredFields = ['title', 'description', 'price', 'category'];
				for (let key of requiredFields) {
					if (!this.formData[key]) {
						uni.showToast({ title: '请填写所有商品信息', icon: 'none' });
						return;
					}
				}

				// 新增：图片信息 “二选一” 校验
				if (!this.formData.imageUrl && !this.formData.imageBase64) {
					uni.showToast({ title: '图片URL和Base64码至少要填一项', icon: 'none' });
					return;
				}

				try {
					await request({ url: '/products', method: 'POST', data: this.formData });
					uni.showToast({ title: '发布成功！' });
					
					// 清空表单
					this.formData = { title: '', description: '', price: null, category: '', imageUrl: '', imageBase64: '' };
					
					setTimeout(() => { uni.switchTab({ url: '/pages/index/index' });	}, 1500);

				} catch (error) {
					// 显示后端返回的错误信息
					const message = error?.data?.message || '发布失败，请重试';
					uni.showToast({ title: message, icon: 'none' });
				}
			}
		}
	};
</script>

<style>
.form-card { background: #fff; padding: 30rpx; border-radius: 10rpx; }
.form-input { border: 1px solid #eee; padding: 15rpx; margin-bottom: 20rpx; }
.form-textarea { border: 1px solid #eee; padding: 15rpx; margin-bottom: 20rpx; width: auto; height: 200rpx; }
.submit-btn { background-color: #007AFF; color: #fff; margin-top: 20rpx; }
.image-section-title { margin-bottom: 10rpx; color: #666; font-size: 28rpx; }
</style>


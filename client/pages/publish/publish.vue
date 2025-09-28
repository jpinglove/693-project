<template>
	<view class="container">
		<view class="form-card">
			<input class="form-input" v-model="formData.title" placeholder="商品标题" />
			<textarea class="form-textarea-description" v-model="formData.description" placeholder="商品描述..."></textarea>
			<input class="form-input" v-model="formData.price" type="number" placeholder="价格" />
			<input class="form-input" v-model="formData.category" placeholder="分类 (如图书、电子产品)" />
			
			<!-- 图片上传区 -->
			<view class="image-uploader">
				<view v-if="!imagePreview" class="upload-btn" @click="chooseImage">
					<text class="plus-icon">+</text>
					<text>选择图片</text>
				</view>
				<view v-else class="image-preview-wrapper" @click="chooseImage">
					<image class="image-preview" :src="imagePreview" mode="aspectFill"></image>
				</view>
			</view>

			<button class="submit-btn" :disabled="uploading" @click="submitForm">{{ uploading ? '发布中...' : '确认发布' }}</button>
		</view>
	</view>
</template>

<script>
	// 从 request.js 中获取 API 的基础 URL
	import { BASE_URL } from '@/utils/request.js';
	import { mapMutations } from 'vuex';

	export default {
		data() {
			return {
				formData: {
					title: '',
					description: '',
					price: null,
					category: ''
				},
				imageTempPath: '', // 存储选择的图片的临时路径
				imagePreview: '', // 用于预览图片
				uploading: false
			};
		},
		onShow() {
			if (!this.$store.state.token) {
				uni.showToast({ title: '请先登录', icon: 'none', duration: 2000 });
				setTimeout(() => { uni.switchTab({ url: '/pages/my/my' }); }, 2000);
			}
		},
		methods: {
			...mapMutations(['SET_HOME_NEEDS_REFRESH']),
			chooseImage() {
				uni.chooseImage({
					count: 1, // 只选择一张
					sizeType: ['compressed'], // 选择压缩图
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.imageTempPath = res.tempFilePaths[0];
						this.imagePreview = res.tempFilePaths[0];
					}
				});
			},
			submitForm() {
				// 基础信息校验
				const requiredFields = ['title', 'description', 'price', 'category'];
				for (let key of requiredFields) {
					if (!this.formData[key]) {
						uni.showToast({ title: '请填写所有商品信息', icon: 'none' });
						return;
					}
				}
				if (!this.imageTempPath) {
					uni.showToast({ title: '请选择一张图片', icon: 'none' });
					return;
				}

				this.uploading = true;

				uni.uploadFile({
					url: BASE_URL + '/products', // 完整的上传地址
					filePath: this.imageTempPath,
					name: 'imageFile', // 必须和后端 multer.single('imageFile') 的名字一致
					header: {
						'Authorization': `Bearer ${this.$store.state.token}`
					},
					formData: this.formData, // 其他表单数据
					success: (uploadFileRes) => {
						uni.showToast({ title: '发布成功！' });
						this.SET_HOME_NEEDS_REFRESH(true);
						// 清空表单
						this.formData = { title: '', description: '', price: null, category: '' };
						this.imagePreview = '';
						this.imageTempPath = '';
						setTimeout(() => { uni.switchTab({ url: '/pages/index/index' }); }, 1500);
					},
					fail: (err) => {
						uni.showToast({ title: '发布失败，请重试', icon: 'none' });
						console.error(err);
					},
					complete: () => {
						this.uploading = false;
					}
				});
			}
		}
	};
</script>

<style>
/* ... 其他样式保持不变 ... */
.form-card { background: #fff; padding: 30rpx; border-radius: 10rpx; }
.form-input { border: 1px solid #eee; padding: 15rpx; margin-bottom: 20rpx; }
.form-textarea-description { border: 1px solid #eee; padding: 15rpx; margin-bottom: 20rpx; width: auto; height: 200rpx; }
.submit-btn { background-color: #007AFF; color: #fff; margin-top: 20rpx; }
/* 新增图片上传样式 */
.image-uploader { margin-bottom: 20rpx; }
.upload-btn { width: 200rpx; height: 200rpx; border: 2px dashed #ccc; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
.plus-icon { font-size: 60rpx; }
.image-preview-wrapper { width: 200rpx; height: 200rpx; }
.image-preview { width: 100%; height: 100%; }
</style>


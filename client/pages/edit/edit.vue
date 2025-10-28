<template>
  <view class="container" v-if="!loading">
    <view class="form-card">
      <!-- 增加表单标签和分组 -->
      <view class="form-group">
        <text class="form-label">商品名称</text>
        <input
          class="form-input"
          v-model="formData.title"
          placeholder="请输入商品标题"
        />
      </view>

      <view class="form-group">
        <text class="form-label">商品描述</text>
        <textarea
          class="form-textarea-description"
          v-model="formData.description"
          placeholder="请输入商品描述..."
        ></textarea>
      </view>

      <view class="form-group">
        <text class="form-label">价格</text>
        <input
          class="form-input"
          v-model="formData.price"
          type="number"
          placeholder="请输入价格"
        />
      </view>

      <view class="form-group">
        <text class="form-label">分类</text>
        <input
          class="form-input"
          v-model="formData.category"
          placeholder="如: 图书、电子产品"
        />
      </view>
	  
	  <view class="form-group">
	      <text class="form-label">校区</text>
	      <picker @change="onCampusChange" :value="campusIndex" :range="campusOptions">
	          <view class="form-input">{{ campusOptions[campusIndex] }}</view>
	      </picker>
	  </view>
	  <view class="form-group">
	      <text class="form-label">新旧程度</text>
	      <picker @change="onConditionChange" :value="conditionIndex" :range="conditionOptions">
	          <view class="form-input">{{ conditionOptions[conditionIndex] }}</view>
	      </picker>
	  </view>

      <view class="form-group">
        <text class="form-label">商品图片</text>
        <view class="image-uploader">
          <view class="upload-btn" @click="chooseImage">
            <image
              class="image-preview"
              :src="imagePreview"
              mode="aspectFill"
            ></image>
            <view class="re-upload-text">点击更换图片</view>
          </view>
        </view>
      </view>

      <view class="button-group">
        <button class="cancel-btn" @click="handleCancel">取消</button>
        <button class="submit-btn" :disabled="saving" @click="handleSave">
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
  import request, { BASE_URL } from "@/utils/request.js";
  import { mapMutations } from 'vuex';

  export default {
    data() {
      return {
        productId: null,
        loading: true,
        saving: false,
        formData: {
          title: "",
          description: "",
          price: null,
          category: "",
		  campus: '',
		  condition: ''
        },
        imageTempPath: "",
        imagePreview: "",
		campusOptions: ['主校区', '南校区', '北校区'],
		campusIndex: 0,
		conditionOptions: ['全新', '九成新', '八成新', '轻微瑕疵'],
		conditionIndex: 0
      };
    },
    onLoad(options) {
      if (!options.id) {
        uni.showToast({ title: "无效的商品", icon: "none" });
        uni.navigateBack();
        return;
      }
      this.productId = options.id;
      this.fetchProductData();
    },
    methods: {
		...mapMutations(['SET_HOME_NEEDS_REFRESH']),
      async fetchProductData() {
        try {
          const data = await request({ url: `/products/${this.productId}` });
          this.formData.title = data.title;
          this.formData.description = data.description;
          this.formData.price = data.price;
          this.formData.category = data.category;
		  this.formData.campus = data.campus || ''; // 默认值
		  this.formData.condition = data.condition || ''; // 默认值
          
		this.campusIndex = this.campusOptions.indexOf(this.formData.campus);
		if (this.campusIndex === -1) this.campusIndex = 0; // 默认选第一个

		this.conditionIndex = this.conditionOptions.indexOf(this.formData.condition);
		if (this.conditionIndex === -1) this.conditionIndex = 0; // 默认选第一个
		  
		  this.imagePreview = `${BASE_URL}/products/${
            this.productId
          }/image?t=${new Date().getTime()}`;
          this.loading = false;
        } catch (e) {
          uni.showToast({ title: "加载商品信息失败", icon: "none" });
        }
      },
	  onCampusChange(e) {
		  this.campusIndex = e.detail.value;
		  this.formData.campus = this.campusOptions[this.campusIndex];
	  },
	  onConditionChange(e) {
		this.conditionIndex = e.detail.value;
		this.formData.condition = this.conditionOptions[this.conditionIndex];
	},
      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            // 将新选择的图片临时路径保存起来
            this.imageTempPath = res.tempFilePaths[0];
            // 同时更新预览图
            this.imagePreview = res.tempFilePaths[0];
          },
        });
      },
      handleCancel() {
        uni.navigateBack();
      },
      handleSave() {
        this.saving = true;
		this.formData.campus = this.campusOptions[this.campusIndex];
		this.formData.condition = this.conditionOptions[this.conditionIndex];
		
        if (this.imageTempPath) {
          uni.uploadFile({
            url: `${BASE_URL}/products/${this.productId}`,
            filePath: this.imageTempPath,
            name: "imageFile",
            method: "PUT",
            header: { Authorization: `Bearer ${this.$store.state.token}` },
            formData: this.formData,
            success: (res) => {
              this.onSaveSuccess();
            },
            fail: (err) => {
              this.onSaveFail(err);
            },
            complete: () => {
              this.saving = false;
            },
          });
        } else {
          request({
            url: `/products/${this.productId}`,
            method: "PUT",
            data: this.formData,
          })
            .then((res) => {
              this.onSaveSuccess();
            })
            .catch((err) => {
              this.onSaveFail(err);
            })
            .finally(() => {
              this.saving = false;
            });
        }
      },
      onSaveSuccess() {
        uni.showToast({ title: "保存成功" });
        this.SET_HOME_NEEDS_REFRESH(true);
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      },
      onSaveFail(err) {
        console.error(err);
        uni.showToast({ title: "保存失败，请重试", icon: "none" });
      },
    },
  };
</script>

<style>
  /* 表单样式 */
  .container {
    padding: 20rpx;
  }
  .form-card {
    background: #fff;
    padding: 30rpx;
    border-radius: 10rpx;
  }
  .form-group {
    margin-bottom: 30rpx;
  }
  .form-label {
    font-size: 30rpx;
    color: #007aff;
    margin-bottom: 10rpx;
    display: block;
  }
  .form-input {
    border: 1px solid #eee;
    padding: 15rpx;
    border-radius: 5rpx;
  }
  .form-textarea-description {
    border: 1px solid #eee;
    padding: 15rpx;
    width: auto; /* uni-app 会自动处理宽度 */
    height: 200rpx;
    border-radius: 5rpx;
  }

  /* 图片上传区域样式 */
  .image-uploader {
    margin-top: 10rpx;
  }
  .upload-btn {
    width: 200rpx;
    height: 200rpx;
    position: relative;
    border: 2px dashed #ccc;
    border-radius: 10rpx;
    overflow: hidden; /* 确保子元素不超出圆角 */
  }
  .image-preview {
    width: 100%;
    height: 100%;
  }
  .re-upload-text {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    text-align: center;
    padding: 5rpx 0;
    font-size: 24rpx;
  }

  /* 按钮组样式 */
  .button-group {
    display: flex;
    margin-top: 40rpx;
  }
  .cancel-btn {
    flex: 1;
    margin-right: 10rpx;
    background-color: #f0f0f0;
  }
  .submit-btn {
    flex: 1;
    margin-left: 10rpx;
    background-color: #007aff;
    color: #fff;
  }
</style>

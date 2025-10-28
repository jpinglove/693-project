<template>
  <view class="container">
    <view v-if="products.length > 0">
      <view class="product-item" v-for="product in products" :key="product._id">
        <view class="main-content" @click="goToDetail(product._id)">
          <image
            class="product-image"
            :src="getProductImageUrl(product._id)"
          ></image>
          <view class="product-info">
            <text class="product-title">{{ product.title }}</text>
            <view class="bottom-info">
				<text class="product-time">{{ formatTime(product.updatedAt) }}</text>
				<text class="product-views">· {{ product.viewCount || 0 }} 次浏览</text>
              <text class="product-price">¥{{ product.price }}</text>
              <text
                :class="[
                  'status-badge',
                  product.status === 'sold' ? 'sold' : 'selling',
                ]"
              >
                {{ product.status === "sold" ? "已售出" : "售卖中" }}
              </text>
            </view>
          </view>
        </view>
        <!-- 编辑按钮区域 -->
        <view v-if="showEditButton" class="edit-section">
          <button class="edit-button" size="mini" @click="onEdit(product._id)">
            <image class="edit-icon" src="/static/edit.png"></image>
            <text>编辑</text>
          </button>
        </view>
      </view>
    </view>
    <view v-else class="empty-container">
      <image class="empty-image" src="/static/empty.png"></image>
      <text class="empty-text">这里什么都没有哦~</text>
    </view>
  </view>
</template>

<script>
  import { BASE_URL } from "@/utils/request.js";
  export default {
	name: 'product-list',
    props: {
      products: {
        type: Array,
        default: () => [],
      },
      showEditButton: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      getProductImageUrl(id) {
        return `${BASE_URL}/products/${id}/image?t=${new Date().getTime()}`;
      },
      goToDetail(id) {
        uni.navigateTo({
          url: `/pages/detail/detail?id=${id}`,
        });
      },
      onEdit(id) {
        this.$emit("edit", id);
      },
		formatTime(isoString) {
			if (!isoString) return '';

			const date = new Date(isoString);
			const now = new Date();
			const diff = now.getTime() - date.getTime(); // 毫秒差
			
			const diffMinutes = Math.floor(diff / (1000 * 60));
			const diffHours = Math.floor(diff / (1000 * 60 * 60));
			const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
			
			if (diffMinutes < 1) {
				return '刚刚';
			} else if (diffMinutes < 60) {
				return `${diffMinutes}分钟前`;
			} else if (diffHours < 24) {
				return `${diffHours}小时前`;
			} else if (diffDays < 7) {
				return `${diffDays}天前`;
			} else {
				// 超过7天，显示日期
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			}
		}
    },
  };
</script>

<style scoped>
  .container {
    padding: 20rpx;
  }
  .product-item {
    display: flex;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background: #fff;
    border-radius: 10rpx;
  }
  .product-image {
    width: 150rpx;
    height: 150rpx;
    margin-right: 20rpx;
    border-radius: 10rpx;
  }
  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .bottom-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .product-time {
  	font-size: 24rpx;
  	color: #999;
  	margin-right: auto;
  	padding-right: 20rpx;
  }
  .product-price {
    color: red;
    font-weight: bold;
  }
  .status-badge {
    padding: 5rpx 15rpx;
    border-radius: 20rpx;
    color: #fff;
    font-size: 24rpx;
  }
  .selling {
    background-color: #28a745;
  }
  .sold {
    background-color: #dc3545;
  }
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
  .main-content {
    flex: 1;
    display: flex;
  }
  .edit-section {
    padding-left: 20rpx;
    border-left: 1px solid #f0f0f0;
    margin-left: 20rpx;
  }
  .edit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #007aff;
    color: white;
    padding: 0 15rpx;
  }
  .edit-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
  }
  .meta-info {
  	display: flex;
  	align-items: center;
  	font-size: 24rpx;
  	color: #999;
  	margin-right: auto;
  }
  .product-views {
  	margin-left: 10rpx;
	color: #999;
	font-size: 20rpx;
  }
  .trade-info {
  	display: flex;
  	align-items: center;
  }
  
  .product-price {
  	color: red;
  	font-weight: bold;
  	font-size: 30rpx;
  	margin-right: 15rpx;
  }
</style>

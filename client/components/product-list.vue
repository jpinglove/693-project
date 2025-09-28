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
  } /* 让主要内容占据大部分空间 */
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
</style>

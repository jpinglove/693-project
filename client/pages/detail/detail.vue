<template>
  <view class="container" v-if="product">
    <image
      class="product-image-detail"
      :src="getProductImageUrl(productId)"
      mode="widthFix"
    ></image>
    <view class="product-card">
      <view class="price-status">
        <text class="price">¥{{ product.price }}</text>
        <!-- 显示商品状态 -->
        <text
          :class="[
            'status-badge',
            product.status === 'sold' ? 'sold' : 'selling',
          ]"
        >
          {{ product.status === "sold" ? "已售出" : "售卖中" }}
        </text>
      </view>
      <text class="title">{{ product.title }}</text>
      <text class="description">{{ product.description }}</text>
      <view class="owner-info">
        <text>发布者: {{ product.owner.nickname }}</text>
      </view>

      <!-- 收藏按钮 -->
      <button
        v-if="product.status === 'selling'"
        class="favorite-btn"
        @click="favoriteProduct"
      >
        {{ isFavorited ? "取消收藏" : "收藏" }}
      </button>
      <!-- 下架按钮，仅当用户是所有者且商品在售时显示 -->
      <button
        v-if="isOwner && product.status === 'selling'"
        class="sold-btn"
        @click="markAsSold"
      >
        标记为已售出 (下架)
      </button>
    </view>
  </view>
</template>

<script>
  import request from "@/utils/request.js";
  import { mapState, mapMutations } from 'vuex';
  import { BASE_URL } from "@/utils/request.js";

  export default {
    data() {
      return {
        productId: null,
        product: null,
        commentContent: "",
      };
    },
    computed: {
      ...mapState(["userInfo"]),
      isFavorited() {
        if (this.product && this.userInfo) {
          return this.product.favoritedBy.includes(this.userInfo.id);
        }
        return false;
      },
      isOwner() {
        return (
          this.product &&
          this.userInfo &&
          this.product.owner._id === this.userInfo.id
        );
      },
    },
    onLoad(options) {
      this.productId = options.id;
      this.fetchProductDetail();
    },
    methods: {
		...mapMutations(['SET_HOME_NEEDS_REFRESH']),
      async fetchProductDetail() {
        try {
          const data = await request({
            url: `/products/${this.productId}`,
            method: "GET",
          });
          this.product = data;
        } catch (error) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      },
      async addComment() {
        if (!this.$store.state.token) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        if (!this.commentContent) {
          uni.showToast({ title: "留言不能为空", icon: "none" });
          return;
        }
        try {
          await request({
            url: `/products/${this.productId}/comments`,
            method: "POST",
            data: { content: this.commentContent },
          });
          this.commentContent = "";
          uni.showToast({ title: "留言成功" });
          this.fetchProductDetail(); // 重新加载数据
        } catch (error) {
          uni.showToast({ title: "留言失败", icon: "none" });
        }
      },
      async favoriteProduct() {
        if (!this.$store.state.token) {
          uni.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        try {
          await request({
            url: `/products/${this.productId}/favorite`,
            method: "POST",
          });
          this.fetchProductDetail(); // 重新加载以更新收藏状态
        } catch (error) {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      },
      // 下架商品的方法
      async markAsSold() {
        uni.showModal({
          title: "确认",
          content: "确定要下架此商品吗？此操作不可逆。",
          success: async (res) => {
            if (res.confirm) {
              try {
                await request({
                  url: `/products/${this.productId}/status`,
                  method: "PUT",
                  data: { status: "sold" },
                });
                uni.showToast({ title: "下架成功" });
				this.SET_HOME_NEEDS_REFRESH(true);
                this.fetchProductDetail(); // 重新加载以更新状态
              } catch (error) {
                uni.showToast({ title: "操作失败", icon: "none" });
              }
            }
          },
        });
      },
      getProductImageUrl(id) {
        // 拼接出完整的图片请求 URL
        return `${BASE_URL}/products/${id}/image`;
      },
    },
  };
</script>

<style>
  /* 样式 */
  .product-image-detail {
    width: 100%;
  }
  .product-card {
    background: #fff;
    padding: 20rpx;
    margin-top: -10rpx;
  }
  .price {
    color: red;
    font-size: 40rpx;
    font-weight: bold;
  }
  .title {
    font-size: 32rpx;
    display: block;
    margin: 10rpx 0;
  }
  .favorite-btn {
    margin-top: 20rpx;
  }
  .comments-section {
    background: #fff;
    margin-top: 20rpx;
    padding: 20rpx;
  }
  .section-title {
    font-weight: bold;
    display: block;
    margin-bottom: 20rpx;
  }
  .comment-item {
    border-bottom: 1px solid #eee;
    padding: 10rpx 0;
  }
  .comment-user {
    font-weight: bold;
    margin-right: 10rpx;
  }
  .comment-form {
    display: flex;
    margin-top: 20rpx;
  }
  .price-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  .sold-btn {
    margin-top: 20rpx;
    background-color: #ffc107;
    color: #333;
  }
</style>

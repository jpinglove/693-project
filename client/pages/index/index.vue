<template>
  <view class="content">
    <!-- 搜索框 -->
    <input
      class="search-bar"
      @confirm="onSearch"
      placeholder="搜索商品标题"
      v-model="searchValue"
    />

    <!-- 加载中提示 -->
    <view v-if="isFirstLoad" class="empty-container">
      <text>正在加载中...</text>
    </view>

    <!-- 商品列表 -->
    <view v-else-if="products.length > 0" class="product-list">
      <view
        class="product-item"
        v-for="product in products"
        :key="product._id"
        @click="goToDetail(product._id)"
      >
        <image
          class="product-image"
          :src="getProductImageUrl(product._id)"
        ></image>
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
  import request from "@/utils/request.js";
  import { BASE_URL } from "@/utils/request.js"; // 导入 BASE_URL
  import { mapState, mapMutations } from 'vuex';

  export default {
    data() {
      return {
        products: [],
        searchValue: "",
        isFirstLoad: true,
      };
    },
	computed: {
		// 将 Vuex 的 state 映射到本组件的 computed 属性
		...mapState(['homeNeedsRefresh'])
	},
    onLoad() {
      this.fetchProducts();
    },
    // onShow 会在每次页面显示时触发，比 onLoad 更适合刷新列表
    onShow() {
	  if (this.homeNeedsRefresh) {
			console.log('Home page needs refresh! Fetching data...');
			// 执行刷新
			this.fetchProducts();
			// 刷新后立刻重置标志位，避免重复刷新
			this.SET_HOME_NEEDS_REFRESH(false);
		}
    },
    // 下拉刷新功能
    onPullDownRefresh() {
      // 清空搜索框并重新加载数据
      this.searchValue = "";
      this.fetchProducts().then(() => {
        uni.stopPullDownRefresh(); // 停止下拉刷新动画
      });
    },
    methods: {
		...mapMutations(['SET_HOME_NEEDS_REFRESH']),
      async fetchProducts(search = "") {
        if (this.isFirstLoad) {
        } else {
          // 对于自动刷新和下拉刷新，可以给出更友好的提示，比如导航栏加载动画
          uni.showNavigationBarLoading();
        }
        try {
          const data = await request({
            url: `/products?search=${search}`,
            method: "GET",
          });
          this.products = data;
          console.log(this.products);
        } catch (error) {
          console.error(error);
          this.products = [];
        } finally {
          this.isFirstLoad = false; // 加载结束
          uni.hideNavigationBarLoading(); // 隐藏导航栏加载动画
        }
      },
      onSearch(event) {
        this.fetchProducts(event.detail.value);
      },
      goToDetail(id) {
        uni.navigateTo({
          url: `/pages/detail/detail?id=${id}`,
        });
      },
      getProductImageUrl(id) {
        // 拼接出完整的图片请求 URL
        return `${BASE_URL}/products/${id}/image?t=${new Date().getTime()}`;
		//return `${BASE_URL}/products/${id}/image`;
      },
    },
  };
</script>

<style>
  /* 简单样式 */
  .search-bar {
    border: 1px solid #ccc;
    padding: 10rpx;
    margin: 20rpx;
    border-radius: 30rpx;
    background: #fff;
  }
  .product-list {
    padding: 0 20rpx;
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .product-price {
    color: red;
    margin-top: 10rpx;
    font-weight: bold;
  }
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

<template>
  <view class="content">
    <!-- 搜索框 -->
		<view class="search-bar-container">
			<input
				class="search-bar"
				@confirm="onSearch"
				placeholder="搜索商品标题"
				v-model="filters.search"
			/>
		</view>
		
		<!-- 排序与筛选栏 -->
		<view class="filter-bar">
			<picker class="sort-picker" @change="onSortChange" :value="sortIndex" :range="sortOptions" range-key="text">
				<view class="picker-content">
					<text>{{ currentSortText }}</text>
					<text class="arrow-down">▼</text>
				</view>
			</picker>
			<view class="filter-btn" @click="openFilterDrawer">
				<image class="filter-icon" src="/static/filter.png"></image>
				<text>筛选</text>
			</view>
		</view>
		
    <!-- 加载中提示 -->
    <view v-if="loading" class="empty-container">
      <text>正在加载中...</text>
    </view>

    <!-- 商品列表 -->
	<!-- 统一使用 <product-list> 组件来渲染列表 -->
	<product-list v-else-if="products.length > 0" :products="products"></product-list>

    <!-- 空状态提示 -->
    <view v-else class="empty-container">
      <image class="empty-image" src="/static/empty.png"></image>
      <text class="empty-text">市场空空如也，快来发布你的第一件商品吧！</text>
    </view>
	
	<!-- 筛选抽屉组件 -->
	<uni-drawer ref="filterDrawer" mode="right" :width="320">
		<view class="filter-drawer-content">
			<text class="drawer-title">筛选条件</text>
			
			<view class="form-group">
				<text class="form-label">校区</text>
				<input class="form-input" v-model="tempFilters.campus" placeholder="如: 主校区, 南校区" />
			</view>
			<view class="form-group">
				<text class="form-label">新旧程度</text>
				<picker class="condition-picker" @change="onConditionChange" :value="conditionIndex" :range="conditionOptions">
					<view class="form-input picker-input">{{ tempFilters.condition || '请选择' }}</view>
				</picker>
			</view>
			<view class="form-group">
				<text class="form-label">价格区间</text>
				<view class="price-range">
					<input class="form-input" type="number" v-model="tempFilters.priceMin" placeholder="最低价" />
					<text class="price-separator">-</text>
					<input class="form-input" type="number" v-model="tempFilters.priceMax" placeholder="最高价" />
				</view>
			</view>

			<view class="drawer-buttons">
				<button class="drawer-btn reset-btn" size="mini" @click="resetFilters">重置</button>
				<button class="drawer-btn confirm-btn" size="mini" @click="applyFilters">确认</button>
			</view>
		</view>
	</uni-drawer>
			
  </view>
</template>

<script>
  import request from "@/utils/request.js";
  import { BASE_URL } from "@/utils/request.js"; // 导入 BASE_URL
  import { mapState, mapMutations } from 'vuex';
  // import uniDrawer from '@/node_modules/@dcloudio/uni-ui/lib/uni-drawer/uni-drawer.vue';

  export default {
	  // 安装 uni-ui
	// npm i @dcloudio/uni-ui
	  // 在 components 选项中注册它
	// components: {
	// 	uniDrawer
	// },
    data() {
      return {
        products: [],
        loading: true,
		// -- 排序和筛选数据 --
		filters: {
			search: "",
			campus: "",
			condition: "",
			priceMin: "",
			priceMax: "",
		},
		// 临时存储抽屉中的筛选条件，点击确认再生效
		tempFilters: {}, 
		sortBy: 'createdAt',
		sortOrder: 'desc',
		sortIndex: 0,
		sortOptions: [
			{ value: { sortBy: 'createdAt', sortOrder: 'desc' }, text: '最新发布' },
			{ value: { sortBy: 'price', sortOrder: 'asc' }, text: '价格最低' },
			{ value: { sortBy: 'price', sortOrder: 'desc' }, text: '价格最高' },
			{ value: { sortBy: 'viewCount', sortOrder: 'desc' }, text: '热度最高' }
		],
		conditionOptions: ['全新', '九成新', '八成新', '轻微瑕疵'],
		conditionIndex: -1 // 初始不选中任何项

      };
    },
	computed: {
		// 将 Vuex 的 state 映射到本组件的 computed 属性
		...mapState(['homeNeedsRefresh']),
		// 计算属性，显示当前排序文本
		currentSortText() {
			return this.sortOptions[this.sortIndex].text;
		}
	},
    onLoad() {
      this.fetchProducts();
    },
    // onShow 会在每次页面显示时触发，比 onLoad 更适合刷新列表
    onShow() {
	  if (this.homeNeedsRefresh) {
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
      async fetchProducts() {
        if (this.loading) {
        } else {
          // 动画
          uni.showNavigationBarLoading();
        }
		
		// filters 和 sort 对象转换成 URL 查询字符串
		const params = { 
			...this.filters,
			sortBy: this.sortBy,
			sortOrder: this.sortOrder
		};
		
		const queryString = Object.keys(params)
			.filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
			.map(key => `${key}=${encodeURIComponent(params[key])}`)
			.join('&');
		// name=aa&age=22&studentid=123
		console.log(queryString);

		try {
			const data = await request({ url: `/products?${queryString}` });
			this.products = data;
        } catch (error) {
          console.error(error);
          this.products = [];
        } finally {
          this.loading = false; // 加载结束
          uni.hideNavigationBarLoading(); // 隐藏导航栏加载动画
        }
      },
      onSearch(event) {
        this.fetchProducts();
        // this.fetchProducts(event.detail.value);
      },
	// 排序和筛选相关的方法
	onSortChange(e) {
		const index = Number(e.detail.value);
		const selectedOption = this.sortOptions[index];
		console.log(JSON.stringify(this.sortOptions[index]))
		console.log(JSON.stringify(selectedOption))
		console.log(JSON.stringify(selectedOption['value']))
		
		const value = selectedOption['value']
		
		console.log('index =', e.detail.value)
		if (selectedOption) {
			console.log(JSON.stringify(value))
			this.sortIndex = index;
			this.sortBy = value.sortBy;
			this.sortOrder = value.sortOrder;
			
			console.log('sortIndex =', index)
			console.log('sortBy =', value.sortBy)
			console.log('sortOrder =', value.sortOrder)
			
			this.fetchProducts();
		}
	},

	openFilterDrawer() {
		// 打开抽屉时，将当前生效的筛选条件传给变量
		this.tempFilters = JSON.parse(JSON.stringify(this.filters));
		// 同步picker的选中项
		this.conditionIndex = this.conditionOptions.indexOf(this.tempFilters.condition);
		this.$refs.filterDrawer.open();
	},
	
	onConditionChange(e) {
		this.conditionIndex = e.detail.value;
		this.tempFilters.condition = this.conditionOptions[this.conditionIndex];
	},

	applyFilters() {
		// 点击确认时，将临时筛选条件应用到正式的筛选条件，并触发数据请求
		this.filters = JSON.parse(JSON.stringify(this.tempFilters));
		this.fetchProducts();
		this.$refs.filterDrawer.close();
	},

	resetFilters() {
		// 重置临时筛选条件
		this.tempFilters = {
			search: this.filters.search, // 保留搜索框的内容
			campus: "",
			condition: "",
			priceMin: "",
			priceMax: "",
		};
		this.conditionIndex = -1;
	},
    },
  };
</script>

<style>
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
  
  /* 排序筛选栏样式 */
  	.filter-bar {
  		display: flex;
  		justify-content: space-around;
  		align-items: center;
  		padding: 15rpx;
  		background: #fff;
  		border-bottom: 1px solid #f0f0f0;
  		font-size: 28rpx;
  	}
  	.sort-picker .picker-content {
  		display: flex;
  		align-items: center;
  	}
  	.arrow-down {
  		margin-left: 8rpx;
  		font-size: 20rpx;
  		color: #999;
  	}
  	.filter-btn {
  		display: flex;
  		align-items: center;
  		color: #007AFF;
  	}
  	.filter-icon {
  		width: 32rpx;
  		height: 32rpx;
  		margin-right: 8rpx;
  	}
  	
  	/* 抽屉样式 */
  	.filter-drawer-content {
  		padding: 30rpx;
  	}
  	.drawer-title {
  		font-size: 32rpx;
  		font-weight: bold;
  		margin-bottom: 40rpx;
  		display: block;
  	}
  	.form-group {
  		margin-bottom: 30rpx;
  	}
  	.form-label {
  		font-size: 28rpx;
  		color: #666;
  		margin-bottom: 10rpx;
  		display: block;
  	}
  	.form-input {
  		border: 1px solid #eee;
  		padding: 15rpx;
  		border-radius: 5rpx;
  		font-size: 28rpx;
  	}
  	.price-range {
  		display: flex;
  		align-items: center;
  	}
  	.price-separator {
  		margin: 0 15rpx;
  		color: #999;
  	}
  	.picker-input {
  		color: #333; /* 确保picker有正常的文字颜色 */
  	}
  	.drawer-buttons {
  		display: flex;
  		margin-top: 50rpx;
  	}
  	.drawer-btn {
  		flex: 1;
  	}
  	.reset-btn {
  		margin-right: 15rpx;
  	}
  
</style>

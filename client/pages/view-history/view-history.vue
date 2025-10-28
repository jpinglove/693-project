<template>
	<view class="container">
		<view v-if="loading" class="loading-container">
			<text>加载中...</text>
		</view>
		<view v-else>
			<!-- 空状态的提示文本 -->
			<product-list :products="historyProducts" empty-text="你还没有浏览过任何商品哦~" title="浏览记录"></product-list>

			<!-- 分页器只在总页数大于1时才显示 -->
			<view class="pagination" v-if="totalPages > 1">
				<button 
					class="page-btn" 
					:disabled="page <= 1" 
					@click="changePage(page - 1)"
				>
					上一页
				</button>
				<text class="page-info">{{ page }} / {{ totalPages }}</text>
				<button 
					class="page-btn" 
					:disabled="page >= totalPages" 
					@click="changePage(page + 1)"
				>
					下一页
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import request from '@/utils/request.js';
export default {
    data() {
        return {
            historyProducts: [],
            loading: true,
            page: 1,
            totalPages: 0,
            total: 0
        };
    },
    onShow() {
        this.fetchHistory(1);
    },
    methods: {
			async fetchHistory(newPage) {
				if (this.page === 1 && this.totalPages === 0) {
					this.loading = true;
				} else {
					uni.showLoading({ title: '加载中...' });
				}
				try {
					const data = await request({ 
						url: `/user/view-history?page=${newPage}&limit=10`
					});

					// 返回的是 { history: [...], ... }
					// 提取 history 数组中的 product 对象
					this.historyProducts = data.history.map(item => item.product).filter(p => p); // filter(p => p) 过滤掉可能已删除的商品
					
					this.page = data.page;
					this.totalPages = data.pages > 0 ? data.pages : 1;
					this.total = data.total;
					console.log("total record : ", this.total )
					
					uni.hideLoading();
					this.loading = false;
				} catch (e) {
					uni.hideLoading();
					this.loading = false;
					uni.showToast({ title: '加载失败', icon: 'none' });
				} finally {
					this.loading = false;
				}
			},
			changePage(newPage) {
				if (this.page === newPage) return;
				if (newPage > 0 && newPage <= this.totalPages) {
					this.fetchHistory(newPage);
				}
			}
        }
    } 
</script>

<style>
.container {
	padding-bottom: 120rpx; /* 分页器按钮空间 */
}
.loading-container {
	text-align: center;
	padding-top: 200rpx;
	color: #999;
}
.pagination {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	align-items: center;
	background-color: #fff;
	padding: 20rpx;
	border-top: 1px solid #f0f0f0;
	box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
}
.page-btn {
	font-size: 28rpx;
	&[disabled] {
		background-color: #f0f0f0;
		color: #c0c0c0;
	}
}
.page-info {
	color: #666;
}
</style>

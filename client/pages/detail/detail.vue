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
      <!-- 下架按钮，当用户是所有者且商品在售时显示 -->
      <button
        v-if="isOwner && product.status === 'selling'"
        class="sold-btn"
        @click="confirmSale"
      >
        确认卖出
      </button>
    </view>
	
	
		<!-- 当商品售出时显示评价区 -->
		<view class="evaluation-section" v-if="product.status === 'sold'">
			<text class="section-title">为卖家评价</text>
			
			<!-- 用户已评价过 -->
			<view v-if="hasEvaluated" class="evaluation-prompt">
				<text>您已评价过本次交易。</text>
			</view>
			
			<!-- 用户是卖家本人 -->
			<view v-else-if="isOwner" class="evaluation-prompt">
				<text>您是该商品卖家，无法评价。</text>
			</view>

			<!-- 用户未登录 -->
			<view v-else-if="!token" class="evaluation-prompt">
				<text>登录后即可评价卖家</text>
			</view>

			<!-- 显示评价按钮 -->
			<view v-else class="evaluation-buttons">
				<button class="eval-btn good" @click="submitEvaluation('good')">👍 好评</button>
				<button class="eval-btn neutral" @click="submitEvaluation('neutral')">😐 中评</button>
				<button class="eval-btn bad" @click="submitEvaluation('bad')">👎 差评</button>
			</view>
		</view>
	
	<!-- 留言区 -->
	<view class="comments-section">
		<text class="section-title">留言区 ({{ product.comments ? product.comments.length : 0 }})</text>
		
		<!-- 留言输入表单 ,登录用户可见 -->
		<view class="comment-form" v-if="token">
			<input class="comment-input" v-model="commentContent" placeholder="发表你的留言..." />
			<button class="submit-comment-btn" size="mini" @click="addComment" :disabled="isSubmitting">提交</button>
		</view>
		<view class="comment-login-prompt" v-else>
			<text>登录后即可发表留言</text>
		</view>

		<!-- 留言列表 -->
		<view class="comments-list" v-if="product.comments && product.comments.length > 0">
			<view class="comment-item" v-for="comment in product.comments" :key="comment._id">
				<view class="comment-header">
					<text class="comment-user">{{ comment.nickname }}</text>
					<text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
				</view>
				<text class="comment-content">{{ comment.content }}</text>
			</view>
		</view>
		<view class="no-comments" v-else>
			<text>还没有留言，快来抢沙发吧！</text>
		</view>
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
      ...mapState(['userInfo', 'token']),
	  // 判断评价
	  hasEvaluated() {
			if (this.product && this.userInfo && this.product.evaluatedBy) {
				return this.product.evaluatedBy.includes(this.userInfo.id);
			}
			return false;
		},
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
	  // 增加浏览量
	  this.incrementViewCount();
    },
    methods: {
		...mapMutations(['SET_HOME_NEEDS_REFRESH']),
		formatTime(timeStr) {
			if (!timeStr) return '';
			const date = new Date(timeStr);
			return date.toLocaleString();
		},
      async fetchProductDetail() {
        try {
          const data = await request({
            url: `/products/${this.productId}`,
            method: "GET",
          });
		  // 对 comments 数组按时间排序
		  if (data.comments && Array.isArray(data.comments)) {
			  data.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		  }
          this.product = data;
        } catch (error) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      },
		// 提交评价的方法
		async submitEvaluation(type) {
			uni.showLoading({ title: '正在提交...' });
			try {
				await request({
					url: `/products/${this.productId}/evaluate`,
					method: 'POST',
					data: { type: type }
				});
				uni.hideLoading();
				uni.showToast({ title: '评价成功！' });

				// 评价成功后，刷新页面/显示“您已评价过”
				this.fetchProductDetail();

			} catch (error) {
				uni.hideLoading();
				const message = error?.data?.message || '评价失败';
				uni.showToast({ title: message, icon: 'none' });
			}
		},
	// 添加留言的方法
	async addComment() {
		if (!this.commentContent.trim()) {
			uni.showToast({ title: '留言不能为空', icon: 'none' });
			return;
		}
		
		this.isSubmitting = true;
		try {
			await request({
				url: `/products/${this.productId}/comments`,
				method: 'POST',
				data: { content: this.commentContent }
			});
			this.commentContent = ''; // 清空输入框
			uni.showToast({ title: '留言成功' });
			
			// 留言成功后，立即刷新整个商品数据以显示新留言
			this.fetchProductDetail();

		} catch (error) {
			uni.showToast({ title: '留言失败，请重试', icon: 'none' });
		} finally {
			this.isSubmitting = false;
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
      // 卖出商品
      async confirmSale() {
        uni.showModal({
          title: "确认",
          content: "确定要卖出此商品吗？此操作不可逆。",
          success: async (res) => {
            if (res.confirm) {
              try {
                await request({
                  url: `/products/${this.productId}/sell`,
                  method: "POST",
                });
                uni.showToast({ title: "卖出成功" });
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
	  // 增加浏览量的方法
		incrementViewCount() {
			if (this.$store.state.token) {
				request({
					url: `/products/${this.productId}/view`,
					method: 'PUT'
				}).catch(err => {
					console.error("增加浏览数量失败", err);
				});
			}
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
  .comments-section {
		background: #fff;
		margin-top: 20rpx;
		padding: 30rpx;
		border-radius: 10rpx;
	}
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		display: block;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 1px solid #f0f0f0;
  	}
  	.comment-form {
  		display: flex;
  		align-items: center;
  		margin-bottom: 30rpx;
  	}
  	.comment-input {
  		flex: 1;
  		border: 1px solid #eee;
  		padding: 10rpx 20rpx;
  		border-radius: 30rpx;
  		margin-right: 20rpx;
  	}
  	.submit-comment-btn {
  		background-color: #007AFF;
  		color: white;
  	}
  	.comment-login-prompt {
  		text-align: center;
  		color: #999;
  		margin-bottom: 30rpx;
  		font-size: 28rpx;
  	}
  	.comments-list {
  		display: flex;
  		flex-direction: column;
  	}
  	.comment-item {
  		padding: 20rpx 0;
  		border-bottom: 1px solid #f0f0f0;
  	}
  	.comment-item:last-child {
  		border-bottom: none;
  	}
  	.comment-header {
  		display: flex;
  		justify-content: space-between;
  		align-items: center;
  		margin-bottom: 10rpx;
  	}
  	.comment-user {
  		font-weight: bold;
  		color: #555;
  	}
  	.comment-time {
  		font-size: 24rpx;
  		color: #999;
  	}
  	.comment-content {
  		color: #333;
  		word-break: break-all;
  	}
  	.no-comments {
  		text-align: center;
  		color: #999;
  		padding: 40rpx 0;
  	}
	/* 评价区样式 */
	.evaluation-section {
		background: #fff;
		margin-top: 20rpx;
		padding: 30rpx;
		border-radius: 10rpx;
	}
	.evaluation-prompt {
		text-align: center;
		color: #999;
		padding: 40rpx 0;
		font-size: 28rpx;
	}
	.evaluation-buttons {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 20rpx 0;
	}
	.eval-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		border-radius: 30rpx;
	}
	.good { background-color: #28a745; }
	.neutral { background-color: #ffc107; }
	.bad { background-color: #dc3545; }
	
</style>

<template>
	<view class="container">
		<!-- 用户已登录 -->
		<view v-if="token">
			<view class="profile-card">
				<text class="welcome-text">欢迎, {{ userInfo.nickname }}</text>
				<view v-if="isAdmin" class="admin-badge">
					<text>管理员</text>
				</view>
			</view>

			<view class="menu-list">
				<view class="menu-item" @click="goToList('publications')">
					<image class="menu-icon" src="/static/publish_list.png"></image>
					<text class="menu-text">我的发布</text>
					<text class="arrow"> > </text>
				</view>
				<view class="menu-item" @click="goToList('favorites')">
					<image class="menu-icon" src="/static/favorite.png"></image>
					<text class="menu-text">我的收藏</text>
					<text class="arrow"> > </text>
				</view>
				<view class="menu-item" @click="goToList('orders')">
					<image class="menu-icon" src="/static/order.png"></image>
					<text class="menu-text">订单记录</text>
					<text class="arrow"> > </text>
				</view>
				<view class="menu-item" @click="goToList('view-history')">
					<image class="menu-icon" src="/static/history.png"></image>
					<text class="menu-text">浏览记录</text>
					<text class="arrow"> > </text>
				</view>
			</view>
			<!-- 管理员入口 -->
			<view class="menu-list" v-if="isAdmin">
				<view class="menu-item" @click="goToAdminPage">
					<image class="menu-icon" src="/static/dashboard.png"></image>
					<text class="menu-text">后台管理</text>
					<text class="arrow"> > </text>
				</view>
			</view>
			<button class="logout-btn" @click="logout">退出登录</button>
		</view>

		<!-- 用户未登录 -->
		<view v-else class="form-card">
			<!-- 登录表单 -->
			<view v-if="isLoginView">
				<input class="form-input" v-model="loginForm.studentId" placeholder="学号" />
				<input class="form-input" v-model="loginForm.password" type="password" placeholder="密码" />
				<button class="submit-btn" @click="handleLogin">登录</button>
				<text class="switch-text" @click="isLoginView = false">没有账号？去注册</text>
			</view>

			<!-- 注册表单 -->
			<view v-else>
				<input class="form-input" v-model="registerForm.studentId" placeholder="学号" />
				<input class="form-input" v-model="registerForm.nickname" placeholder="昵称" />
				<input class="form-input" v-model="registerForm.password" type="password" placeholder="密码" />
				<button class="submit-btn" @click="handleRegister">注册</button>
				<text class="switch-text" @click="isLoginView = true">已有账号？去登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/utils/request.js'
	import { mapState, mapMutations } from 'vuex'
	import { BASE_URL } from '@/utils/request.js';

	export default {
		data() {
			return {
				isLoginView: true,
				loginForm: {
					studentId: '',
					password: ''
				},
				registerForm: {
					studentId: '',
					nickname: '',
					password: ''
				}
			};
		},
		computed: {
			...mapState(['token', 'userInfo']),
			isAdmin() {
				return this.userInfo && this.userInfo.isAdmin === true;
			}
		},
		methods: {
			...mapMutations(['LOGIN', 'LOGOUT']),
			goToList(page) {
 				uni.navigateTo({
					url: `/pages/${page}/${page}`
				}); 
			},
			goToAdminPage() {
				uni.navigateTo({
					url: '/pages/admin/admin'
				});
			},
			async handleLogin() {
				try {
					const res = await request({
						url: '/auth/login',
						method: 'POST',
						data: this.loginForm
					});
					
					console.log(JSON.stringify(res))
					this.LOGIN({ token: res.accessToken, userInfo: { id: res.id, studentId: res.studentId, nickname: res.nickname, isAdmin: res.isAdmin } });
					uni.showToast({ title: '登录成功' });
					
					if (res.isAdmin == true){
						uni.showToast({ title: '管理员登陆成功' });
						console.log("管理员 isAdmin")
					} 
					
				} catch (error) {
					console.log(error)
					
					uni.showToast({ title: '登录失败，请检查学号或密码', icon: 'none' });
				}
			},
			async handleRegister() {
				try {
					await request({
						url: '/auth/register',
						method: 'POST',
						data: this.registerForm
					});
					uni.showToast({ title: '注册成功，请登录' });
					this.isLoginView = true; // 切换到登录视图
				} catch (error) {
					uni.showToast({ title: '注册失败，学号可能已被使用', icon: 'none' });
				}
			},
			logout() {
				this.LOGOUT();
				uni.showToast({ title: '已退出登录' });
			}
		}
	}
</script>

<style>
.container { padding-bottom: 40rpx; }
.profile-card, .form-card { background: #fff; padding: 30rpx; border-radius: 10rpx; text-align: center; position: relative; }
.welcome-text { font-size: 36rpx; display: block; margin-bottom: 40rpx; }
.logout-btn { background-color: #f44336; color: #fff; margin: 40rpx 20rpx 0; }
.form-input { border: 1px solid #eee; padding: 15rpx; margin-bottom: 20rpx; text-align: left; }
.submit-btn { background-color: #007AFF; color: #fff; margin-bottom: 20rpx; }
.switch-text { color: #007AFF; font-size: 28rpx; }
.menu-list { margin: 20rpx; background: #fff; border-radius: 10rpx; }
.menu-item { display: flex; align-items: center; padding: 25rpx; border-bottom: 1px solid #eee; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { width: 40rpx; height: 40rpx; margin-right: 20rpx; }
.menu-text { flex: 1; }
.arrow { color: #ccc; }


.admin-badge {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	background-color: #ffc107;
	color: #333;
	padding: 5rpx 15rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	font-weight: bold;
}
.admin-section {
	border: 2px solid #ffc107;
}
.admin-text {
	color: #007AFF;
	font-weight: bold;
}

</style>
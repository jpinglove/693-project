<template>
	<view class="container">
		
 		<view class="chart-card">
			<text class="card-title">每日发布量趋势</text>
			<view style="width: 100%; height: 500rpx;">
				<echarts ref="echarts" :option="dailyPostsData" canvasId="echarts1" style="width: 100%; height: 300px;"></echarts>
			</view>
		</view> 

		<view class="chart-card">
			<text class="card-title">每日交易量趋势</text>
			<echarts ref="echarts" :option="dailyTransactionsData" canvasId="echarts2" style="width: 100%; height: 300px;"></echarts>
		</view>

 		<view class="chart-card">
			<text class="card-title">热门分类销售统计</text>
			<view style="width: 100%; height: 500rpx;">
				<echarts ref="echarts" :option="hotCategoriesData" canvasId="echarts3" style="width: 100%; height: 300px;"></echarts>
			</view>
		</view>
			
		<view class="admin-section">
			<text class="section-title">数据导出</text>
			<view class="button-grid">
				<button @click="exportData('/admin/export/users', 'all_users.csv')">导出用户</button>
				<button @click="exportData('/admin/export/products', 'all_products.csv')">导出商品</button>
				<button @click="exportData('/admin/export/orders', 'all_orders.csv')">导出订单</button>
			</view>
		</view>
		
	</view>
</template>
<script>
	import request from '@/utils/request.js';
	import { downloadFile } from '@/utils/downloader.js';
	import { BASE_URL } from '@/utils/request.js';
	// 插件市场
	// https://ext.dcloud.net.cn/search?q=echart
	
	export default {
		data() {
			return { 
				dailyPostsData: {},
				dailyTransactionsData: {},
				hotCategoriesData: {},
			}
		},
		onLoad() {
			this.fetchDailyPostsStats();
			this.fetchDailyTransactionsStats();
			this.fetchHotCategoriesStats();
		},
		onReady() {
		},
		methods: {
			async fetchDailyPostsStats() {
				try {
					const stats = await request({ url: '/admin/stats/daily-posts' });
					
					const categories = stats.map(item => item._id);
					const data = stats.map(item => item.count);
					
					// 按照 eCharts 的格式组织数据
					const chartData = {
						tooltip: {
							trigger: 'axis'
						},
						grid: { // 调整图表边距，防止标签显示不全
							left: '3%',
							right: '4%',
							bottom: '3%',
							containLabel: true
						},
						xAxis: {
							type: 'category',
							boundaryGap: false, // 让折线图从Y轴0刻度开始
							data: categories // X轴数据
						},
						yAxis: {
							type: 'value'
						},
						series: [
							{
								name: '发布量',
								type: 'line', // 指定为折线图
								data: data // Y轴数据
							}
						]
					};
					this.dailyPostsData = chartData;
				} catch (error) {
					console.error("Failed to fetch daily posts stats:", error);
				}
			},
			async fetchDailyTransactionsStats() {
				try {
					const stats = await request({ url: '/admin/stats/daily-transactions' });
					
					const categories = stats.map(item => item._id);
					const data = stats.map(item => item.count);

					// ECharts 柱状图 option
					const option = {
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'shadow' // 鼠标悬浮时显示阴影指示器
							}
						},
						grid: {
							left: '3%',
							right: '4%',
							bottom: '3%',
							containLabel: true
						},
						xAxis: {
							type: 'category',
							data: categories
						},
						yAxis: {
							type: 'value'
						},
						series: [
							{
								name: '交易量',
								type: 'bar', // 指定类型为柱状图
								barWidth: '60%', // 柱子的宽度
								data: data
							}
						]
					};

					this.dailyTransactionsData = option;
				} catch (error) {
					console.error("Failed to fetch daily transactions stats:", error);
				}
			},
			// 获取热门分类销售统计数据
			async fetchHotCategoriesStats() {
				try {
					const stats = await request({ url: '/admin/stats/hot-categories-by-sales' });
					
					// 转换为 ECharts 饼图需要的格式
					const pieData = stats.map(item => {
						return {
							name: item._id,   // id 映射为 name
							value: item.count // count 映射为 value
						}
					});
					
					// ECharts的饼图 option
					const option = {
						backgroundColor: "#ffffff", // 背景色
						tooltip: {
							trigger: 'item', // 提示框触发类型：数据项
							formatter: '{a} <br/>{b}: {c} ({d}%)' // 提示框格式
						},
						legend: {
							orient: 'vertical', // 图例垂直排列
							left: 10,
							data: pieData.map(item => item.name) // 图例数据
						},
						series: [
							{
								name: '销售量',
								type: 'pie',
								radius: ['40%', '60%'], // 设置成环形图，内外半径
								avoidLabelOverlap: false,
								label: {
									show: false, // 不在图上显示标签
									position: 'center'
								},
								emphasis: {
									label: {
										show: true,
										fontSize: '20',
										fontWeight: 'bold'
									}
								},
								labelLine: {
									show: false
								},
								data: pieData // 数据
							}
						]
					};

					// option 对象赋值给 data 属性
					this.hotCategoriesData = option;
				} catch (error) {
					console.error("Failed to fetch hot categories stats:", error);
				}
			},

			exportData(url, fileName) {
				downloadFile(url, fileName);
			},

		}
	}
</script>

<style>
/* 管理员页面样式 */
.admin-section { margin-top: 40rpx; background: #fff; padding: 20rpx; border-radius: 10rpx; }
.section-title {
	font-size: 32rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1px solid #f0f0f0;
}
.button-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20rpx; margin-top: 20rpx; }

.container { padding: 20rpx; }
.chart-card { background-color: #fff; border-radius: 10rpx; padding: 20rpx; margin-bottom: 30rpx; }
.card-title { font-size: 32rpx; font-weight: bold; display: block; margin-bottom: 20rpx; }

</style>



<template>
    <view class="charts-box">
        <canvas :canvas-id="canvasId" :id="canvasId" class="charts" @touchend="tap"></canvas>
    </view>
</template>
    
<script>
    import UChartsLib from '@qiun/ucharts';
    var uChartsInstance = {};
    
    export default {
        name: 'Ucharts',
        props: {
            chartData: {
                type: Object,
                default: () => ({})
            },
            type: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                canvasId: `ucharts-${Math.random().toString(36).substr(2)}`,
            }
        },
        watch: {
            chartData(newData) {
                if (Object.keys(newData).length > 0) {
                    this.drawCharts(this.canvasId, newData);
                }
            }
        },
        mounted() {
            if (Object.keys(this.chartData).length > 0) {
                this.drawCharts(this.canvasId, this.chartData);
            }
        },
        methods: {
            drawCharts(id, data) {
                const ctx = uni.createCanvasContext(id, this);
				// 构造一个基础配置对象
				let chartOptions = {
					type: this.type,
					context: ctx,
					width: this.getChartWidth(),
					height: this.getChartHeight(),
					series: data.series,
					animation: true,
					// 可以在这里放一些所有图表通用的配置
				};

				// 根据图表类型，条件性地添加 'categories'
				if (this.type === 'line' || this.type === 'column' || this.type === 'bar') {
					chartOptions.categories = data.categories;
				}
				
				// chartOptions 中只包含当前图表需要的属性
				uChartsInstance[id] = new UChartsLib(chartOptions);
            },
            tap(e) {
				if (uChartsInstance[this.canvasId]) {
					uChartsInstance[this.canvasId].touchLegend(e);
					uChartsInstance[this.canvasId].showToolTip(e);
				}
            },
            getChartWidth() {
                // 父容器宽度减去可能的 padding
                return uni.upx2px(750 - 40 - 40); // 假设 client 20rpx, card 20rpx padding
            },
            getChartHeight() {
                // 父容器高度
                return uni.upx2px(500); 
            }
        }
    }
</script>
    
<style scoped>
    .charts-box {
        width: 100%;
        height: 100%;
    }
    .charts {
        width: 100%;
        height: 100%;
    }
</style>


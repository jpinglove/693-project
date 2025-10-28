<template>
  <view>
	<view class="header-bar">
		<text class="page-title">我的发布</text>
		<button class="import-btn" size="mini" @click="importProducts">导入CSV</button>
		<button class="export-btn" size="mini" @click="exportData">导出CSV</button>
	</view>
    <product-list
      :products="products"
      :showEditButton="true"
      @edit="handleEdit"
    ></product-list>
  </view>
</template>
<script>
  import request from "@/utils/request.js";
  // import productList from '@/components/product-list.vue'; // 引入通用列表组件
  import { BASE_URL } from '@/utils/request.js';
	import { downloadFile } from '@/utils/downloader.js'; // 导入下载函数

  export default {
    data() {
      return { products: [] };
    },
    onLoad() {
      // 在页面加载时开始监听
      uni.$on("dataChanged", this.handleDataChange);
    },
    onShow() {
      this.fetchPublications();
    },
    onUnload() {
      // 在页面卸载时移除监听
      uni.$off("dataChanged", this.handleDataChange);
    },
    methods: {
      handleDataChange() {
        // 接收到事件后，重新获取数据
        this.fetchPublications();
      },
      async fetchPublications() {
        try {
          this.products = await request({ url: "/user/publications" });
        } catch (e) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      },
      // 处理编辑事件，跳转到编辑页
      handleEdit(id) {
        uni.navigateTo({
          url: `/pages/edit/edit?id=${id}`,
        });
      },
	  // 导出方法
		exportData() {
			downloadFile('/user/export/publications', 'my_publications.csv');
		},
		importProducts() {
			uni.chooseFile({
				count: 1,
				extension: ['.csv'], // 仅允许选择 csv 文件
				success: (res) => {
					uni.showLoading({ title: '正在上传并导入...' });
					uni.uploadFile({
						url: BASE_URL + '/user/import/products',
						filePath: res.tempFilePaths[0],
						name: 'file',
						header: { 'Authorization': `Bearer ${this.$store.state.token}` },
						success: (uploadRes) => {
							const data = JSON.parse(uploadRes.data);
							console.log('导入结果:',data.message);
							
							let content = `成功: ${data.successCount}条\n失败: ${data.failureCount}条`;
							console.log('导入结果:',data.errors);
							if (data.errors && data.errors.length > 0) {
								// 只显示前几条错误，避免弹窗过大
								content += '\n\n部分错误日志:\n' + data.errors.slice(0, 5).join('\n');
							}
							uni.showModal({
								title: '导入完成',
								content: content,
								showCancel: false
							});
							
							this.fetchPublications();
							
						},
						fail: () => {
							uni.showToast({ title: '导入失败', icon: 'none' });
						},
						complete: () => {
							uni.hideLoading();
						}
					});
				}
			});
		}
    },
  };
</script>

<style>
/* 页面头部样式 */
.header-bar { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; }
.page-title { font-size: 32rpx; font-weight: bold; }
.button-group { display: flex; }
.import-btn { background-color: #007AFF; color: white; margin-right: 15rpx; }
.export-btn { background-color: #19be6b; color: white; }
</style>

<template>
  <view>
    <!-- 列表组件，传入不同的数据和标题, 传入 showEditButton 并监听 @edit 事件 -->
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
  export default {
    // components: { productList },
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
      // 在页面卸载时移除监听，避免内存泄漏
      uni.$off("dataChanged", this.handleDataChange);
    },
    methods: {
      handleDataChange() {
        console.log("My Publications page received dataChanged event!");
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
    },
  };
</script>

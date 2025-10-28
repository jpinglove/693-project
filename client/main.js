import App from './App'
import Vue from 'vue'
import store from './store'

// import productList from './components/product-list.vue'
// Vue.component('product-list', productList)
// import UchartsComponent from './components/ucharts.vue'
// Vue.component('ucharts', UchartsComponent)

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
app.$mount()
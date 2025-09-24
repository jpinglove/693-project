import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        // 优先从本地存储中读取
        token: uni.getStorageSync('token') || '',
        userInfo: uni.getStorageSync('userInfo') || {}
    },
    mutations: {
        LOGIN(state, payload) {
            state.token = payload.token;
            state.userInfo = payload.userInfo;
            // 持久化存储
            uni.setStorageSync('token', payload.token);
            uni.setStorageSync('userInfo', payload.userInfo);
        },
        LOGOUT(state) {
            state.token = '';
            state.userInfo = {};
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
        }
    },
    actions: {
        logout({ commit }) {
            commit('LOGOUT');
        }
    }
})

export default store
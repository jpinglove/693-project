import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        // 优先从本地存储中读取
        token: uni.getStorageSync('token') || '',
        userInfo: uni.getStorageSync('userInfo') || {},
		// 全局的首页刷新标志位
		homeNeedsRefresh: false 
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
        },
		// 用于设置刷新标志位的 mutation
		SET_HOME_NEEDS_REFRESH(state, needsRefresh) {
			state.homeNeedsRefresh = needsRefresh;
		}
    },
    actions: {
        logout({ commit }) {
            commit('LOGOUT');
        }
    }
})

export default store
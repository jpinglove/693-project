import store from '../store'

// 配置后端API地址
// 开发环境可以指向本地, 生产环境指向 vercel 部署的地址
// 'http://192.168.200.138:8080/api'
export const BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://192.168.200.156:8080/api' 
    : 'https://server-693-api.vercel.app/api';

const request = (options) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                ...options.header,
                'Authorization': `Bearer ${store.state.token}`
            },
            success: (res) => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(res.data);
                } else {
                    uni.showToast({ title: '请求失败', icon: 'none' });
                    reject(res);
                }
            },
            fail: (err) => {
                uni.showToast({ title: '网络错误', icon: 'none' });
                reject(err);
            }
        });
    });
};

// 默认导出 request 函数，但 BASE_URL 也可以被具名导入
export default request;
import store from '../store'

// 在这里配置你的后端API地址
// 开发环境可以指向本地, 生产环境指向 Railway 部署的地址
const BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://192.168.200.138:8080/api' 
    : 'https://your-backend-service.up.railway.app/api';

const request = (options) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                ...options.header,
                // 如果有token, 自动附带在header中
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

export default request;
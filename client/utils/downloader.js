import { BASE_URL } from './request.js';
import store from '../store';

function arrayBufferToString(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // 使用 decodeURIComponent 来处理 UTF-8 编码
    try {
        return decodeURIComponent(escape(binary));
    } catch (e) {
        console.error("Failed to decode URI component", e);
        return binary; // 如果解码失败，返回原始二进制字符串
    }
}

export function downloadFile(url, fileName) {
    uni.showLoading({ title: '正在生成文件...' });
	uni.request({
		url: BASE_URL + url,
		header: {
			'Authorization': `Bearer ${store.state.token}`
		},
		// 接收二进制数据
		responseType: 'arraybuffer', 
		success: (res) => {
			// 检查响应头，判断返回的是 JSON 还是 CSV
			const contentType = res.header['Content-Type'] || res.header['content-type'];
			// 后端返回了 JSON , 说明没有数据
			if (contentType && contentType.includes('application/json')) {
				// uni.request 会自动解析 JSON，手动将 ArrayBuffer 转为字符串来解析
				console.log(res.data)
				const dataStr = arrayBufferToString(res.data);
				console.log(dataStr)
				const jsonData = JSON.parse(dataStr);
				console.log(JSON.stringify(jsonData))

				if (jsonData.message === 'No data to export.') {
					uni.showToast({ title: '没有可导出的数据', icon: 'none' });
				} else {
					uni.showToast({ title: '发生未知错误', icon: 'none' });
				}
			} 
			// 后端返回了 CSV 文件
			else if (res.statusCode === 200) {

				// 在 H5 平台，需要将 ArrayBuffer 转为 Blob URL 进行下载
				// #ifdef H5
				const blob = new Blob([res.data]);
				const blobUrl = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = blobUrl;
				link.download = fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(blobUrl);
				// #endif

				// 在 App 平台，需要将 ArrayBuffer 写入临时文件再保存
				// #ifdef APP-PLUS
				const fs = uni.getFileSystemManager();
				const tempFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
				fs.writeFile({
					filePath: tempFilePath,
					data: res.data,
					encoding: 'binary',
					success: () => {
						uni.saveFile({
							tempFilePath: tempFilePath,
							success: (saveRes) => {
								uni.showToast({
									title: `文件已保存至：${saveRes.savedFilePath}`,
									icon: 'none',
									duration: 3000
								});
							}
						});
					}
				});
				// #endif
			} else {
				uni.showToast({ title: '导出失败', icon: 'none' });
			}
		},
		fail: (err) => {
			uni.showToast({ title: '网络错误，导出失败', icon: 'none' });
		},
		complete: () => {
			uni.hideLoading();
		}
	});
}
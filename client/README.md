# client-693
nau 693 项目作业, 客户端代码


使用windows hbuilder 打开;

修改request.js 中的 

// 配置后端API地址
// 开发环境可以指向本地, 生产环境指向 Railway 部署的地址
export const BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://192.168.200.138:8080/api' 
    : 'https://server-693-api.vercel.app/api';


### **总结与正确操作步骤**

下载并安装 HBuilderX: 如果你还没安装，请从 DCloud 官网 下载并安装它。
打开项目:
打开 HBuilderX。
在顶部菜单栏，点击 “文件” -> “导入” -> “从本地目录导入”。
在弹出的窗口中，选择你项目中的 client 文件夹。
安装项目依赖 (在 HBuilderX 中):
在 HBuilderX 左侧的项目管理器中，右键点击你的 client 项目根目录。
选择 “在内置终端中打开”。
在下方打开的终端里，输入并执行 npm install。
运行项目:
在 HBuilderX 的顶部菜单栏，点击 “运行”。
在下拉菜单中，选择 “运行到浏览器”。
在弹出的子菜单中，选择任意一个浏览器（比如 Chrome）。

** 测试运行方法 **
客户端-> run -> webbrowser

**启动用于网页版开发的服务器**：
    ```bash
    客户端-> run -> webbrowser
    ```

**安装 uni-ui**：
    ```bash
    npm i @dcloudio/uni-ui
	npm i @qiun/ucharts
    ```

**代码中导入 uni-ui**：
	```bash
	  import uniDrawer from '@/node_modules/@dcloudio/uni-ui/lib/uni-drawer/uni-drawer.vue';
	```
// 加载 vue
const Vue = require('vue')
// 导入 fs 模块
const fs = require('fs')
// 将 express 加载进来
const express = require('express')
// 创建一个 server 实例
const server = express()
// 挂载处理静态资源的中间件 第一个参数是请求前缀，第二个参数是具体路径
server.use('/dist', express.static('./dist'))
// 加载 vue-server-renderer 中的 createBundleRenderer 方法
const { createBundleRenderer } = require('vue-server-renderer')
// 加载模块处理函数
const setupDevServer = require('./build/setup-dev-server')
	
// 判断当前是否是生产环境
const isProd = process.env.NODE_ENV === 'production'
let renderer, onReady
if (isProd) {	// 生产环境打包--按照之前的处理逻辑
	// 加载通过 webpack 打包好的 vue-ssr-server-bundle.json 文件
	const serverBundle = require('./dist/vue-ssr-server-bundle.json')
	// 加载通过 webpack 打包好的 vue-ssr-client-bundle.json 文件
	const clientManifest = require('./dist/vue-ssr-client-manifest.json')
	// fs 模块读取得到的 buffer 二进制流，需要转换为字符串
	const template = fs.readFileSync('./index.template.html', 'utf-8')
	
	renderer = createBundleRenderer(serverBundle, {
		template, // （可选）页面模板
		runInNewContext: false, // 推荐
		clientManifest // （可选）客户端构建 manifest
	})
} else {	// 开发环境打包
	// 监视打包构建 -> 重新生成 renderer 渲染器
	onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {	// 监视打包构建 之后执行回调函数
		// 基于打包构建后的结果，重新生成 renderer 渲染器
		renderer = createBundleRenderer(serverBundle, {
			template, // （可选）页面模板
			runInNewContext: false, // 推荐
			clientManifest // （可选）客户端构建 manifest
		})
	})
}

const render = async (req, res) => {
	try {
		const html = await renderer.renderToString({ url: req.url })
		// 发送渲染好的内容前，设置响应头当中的 Content-Type， 解决乱码问题
		res.setHeader('Content-Type', 'text/html; charset=utf8')
		res.end(html)
	} catch (err) {
		res.status(500).end('Internal Server Error')
	}
}

// 将服务端路由配置为 * 即所有的路由都会进入到这里
server.get('*', isProd 
	? render 
	: async (req, res) => {
		await onReady
		// 等待有了 renderer 渲染器以后，调用 render 进行渲染
		render(req, res)
	}
)

// 开启端口监听
server.listen(3000, () => {
	console.log('server running at port 3000.')
})
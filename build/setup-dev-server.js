const fs = require('fs')
const path = require('path')
// 加载第三方模块，用来监视文件变化
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
// 关于webpack5 热更新会有点问题
const hotMiddleware = require('webpack-hot-middleware')
// 自己封装一个 resolve 方法
const resolve = file => {
	return path.resolve(__dirname, file)
}

module.exports = (server, callback) => {
	let ready
	const onReady = new Promise(r => ready = r)
	// 处理逻辑---监视构建，更新 renderer
	let serverBundle, template, clientManifest
	const update = () => {
		if (serverBundle && template && clientManifest) {
			ready()
			callback(serverBundle, template, clientManifest)
		}
	}

	// 监视构建 template => 调用 update 函数 => 更新 renderer 渲染器
	const templatePath = resolve('../index.template.html')
	template = fs.readFileSync(templatePath, 'utf-8')
	update()
	// console.log(template)
	// 监听 template 的变化 推荐使用第三方包 chokidar 封装了 fs.watch 和 fs.watchFile
	chokidar.watch(templatePath).on('change', () => {
		template = fs.readFileSync(templatePath, 'utf-8')
		update()
	})

	// 监视构建 serverBundle => 调用 update 函数 => 更新 renderer 渲染器
	const serverConfig = require('./webpack.server.config')
	const serverCompiler = webpack(serverConfig)
	// 编译器自带有监视文件变化的方法---这个方法总是向物理磁盘读写数据
	// serverCompiler.watch({}, (err, stats) => {
	// 	if (err) throw err
	// 	if (stats.hasError) return
	// 	const serverBundleStr = fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
	// 	serverBundle = JSON.parse(serverBundleStr)
	// 	// console.log(serverBundle)
	// 	update()
	// })
	// 使用 中间件 文件保存在内存中---不再向物理磁盘读写数据
	const serverDevMiddleware = devMiddleware(serverCompiler, {
		logLevel: 'silent'	// 不打印日志 这里有个坑 5.0.0版本废弃了这个属性，3.7.2版本这个属性可以用
	})
	serverCompiler.hooks.done.tap('server', () => {
		// const serverBundleStr = serverDevMiddleware.context.outputFileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
		// 5.0.0版本上面的才好使 3.7.2版本下面这个读取方法可以用
		const serverBundleStr = serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')	
		serverBundle = JSON.parse(serverBundleStr)
		update()
	})

	// 监视构建 clientManifest => 调用 update 函数 => 更新 renderer 渲染器
	const clientConfig = require('./webpack.client.config')
	clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
	// api 的问题，为什么要用 clientConfig.entry.api
	clientConfig.entry.app = [
		'webpack-hot-middleware/client?quiet=true&reload=true',
		clientConfig.entry.app
	]
	clientConfig.output.filename = '[name].js'
	const clientCompiler = webpack(clientConfig)
	// 使用 中间件 文件保存在内存中---不再向物理磁盘读写数据
	const clientDevMiddleware = devMiddleware(clientCompiler, {
		publicPath: clientConfig.output.publicPath,
		logLevel: 'silent'	// 不打印日志 这里有个坑 5.0.0版本废弃了这个属性，3.7.2版本这个属性可以用
	})
	clientCompiler.hooks.done.tap('client', () => {
		const clientManifestStr = clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')	
		clientManifest = JSON.parse(clientManifestStr)
		// console.log(clientManifest)
		update()
	})
	server.use(hotMiddleware(clientCompiler, {
		log: false	// 关闭它本身的日志输出
	}))
	// 将 clientDevMiddleware 挂载到 express 服务器上 提供对内存中数据的访问
	server.use(clientDevMiddleware)

	return onReady
}


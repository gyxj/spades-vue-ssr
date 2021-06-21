import { createApp } from './app'

export default async context => {
  	// 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
    // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
  	const { app, router, store } = createApp()
  	const meta = app.$meta()

    // 设置服务器端 router 的位置
    router.push(context.url)
    context.meta = meta

	// 等到 router 将可能的异步组件和钩子函数解析完
	await new Promise(router.onReady.bind(router))

	// 在所有预取钩子(preFetch hook) resolve 后，
    // 我们的 store 现在已经填充入渲染应用程序所需的状态。
    // 当我们将状态附加到上下文，并且 `template` 选项用于 renderer 时，
    // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
    context.state = store.state

	return app
}
import { createApp } from './app'

const { app, router, store } = createApp()

// 当使用 template 时，context.state 将作为 window.__INITIAL_STATE__ 状态，自动嵌入到最终的 HTML 中。
// 而在客户端，在挂载到应用程序之前，store 就应该获取到状态：
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// 这里 App.vue 模板中根元素一定要具有 `id="app"`
router.onReady(() => {
  	app.$mount('#app')
})
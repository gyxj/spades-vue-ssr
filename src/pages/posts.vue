<template>
	<div class="page-wrapper">
		<ul>
			<li v-for="item in posts" :key="item.id">{{item.title}}</li>
		</ul>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	export default {
		name: 'PostsList',
		metaInfo() {
			return {
				title: '列表'
			}
		},
		computed: {
			...mapState(['posts'])
		},
		// Vue SSR 特殊为 服务端渲染提供的生命周期钩子函数
		serverPrefetch() {
			// 发起 action 返回 Promise
			return this.getPosts()
		},
		methods: {
			...mapActions(['getPosts'])
		}
	}
</script>
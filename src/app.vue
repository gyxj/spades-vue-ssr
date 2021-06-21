<template>
	<div id="app">
		<h1>{{ message }}</h1>
		<input type="text" v-model="message">
		<button @click="myClick">按钮</button>
		<br><br><br>
		
		<router-link to="/">Home</router-link>
		<router-link to="/about">About</router-link>
		<router-link to="/posts">Posts</router-link>
		<!-- 这里是路由出口 -->
		<router-view />
	</div>
</template>

<script>
	export default {
		name: 'App',
		data() {
			return {
				message: 'hello vue-ssr'
			}
		},
		methods: {
			myClick() {
				console.log('hello vue-ssr')
			}
		}
	}
</script>
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

// 配置存储容器
export const createStore = () => {
	return new Vuex.Store({
		state: () => ({
			posts: []
		}),
		mutations: {
			setPosts(state, data) {
				state.posts = data
			}
		},
		actions: {
			async getPosts({ commit }) {
				const { data } = await axios({
					method: 'get',
					url: 'https://cnodejs.org/api/v1/topics'
				})
				commit('setPosts', data.data)
			}
		}
	})
}
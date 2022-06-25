import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'

//导航三方库组件
import treeTable from 'vue-table-with-tree-grid'

//配置请求的基础路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//通过axios请求拦截器添加token,保证拥有获取数据的权限
axios.interceptors.request.use((config) => {
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})
//添加原型对象属性,全局引用
Vue.prototype.$http = axios

Vue.config.productionTip = false
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')

Vue.component('tree-table', treeTable)

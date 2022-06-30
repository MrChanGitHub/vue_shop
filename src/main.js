import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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

//注册全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const date = new Date(originVal)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const dt = (date.getDate() + '').padStart(2, '0')
  const hour = (date.getHours() + '').padStart(2, '0')
  const minute = (date.getMinutes() + '').padStart(2, '0')
  const second = (date.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${dt} ${hour}:${minute}:${second}`
})

Vue.config.productionTip = false
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')

//注册全局组件
Vue.component('tree-table', treeTable)
//注册富文本编辑器为全局组件
Vue.use(VueQuillEditor)

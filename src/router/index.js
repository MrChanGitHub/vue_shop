import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  /* 设置路由默认路径 */
  { path: '/', redirect: '/login' },
  //动态加载login组件
  { path: '/login', component: () => import('../components/Login') },
  {
    path: '/home',
    component: () => import('../components/Home'),
    //进入home则重定向到子路由welcome组件
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: () => import('../components/Welcome'),
      },
      {
        path: '/users',
        component: () => import('../components/users/User'),
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights'),
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles'),
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Cate'),
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params'),
      },
      {
        path: '/goods',
        component: () => import('../components/goods/List'),
      },
      {
        path: '/AddGoods',
        component: () => import('../components/goods/AddGoods'),
      },
      {
        path: '/orders',
        component: () => import('../components/goods/Order'),
      },
      {
        path: '/reports',
        component: () => import('../components/goods/Report'),
      },
    ],
  },
]

const router = new VueRouter({
  routes,
})

//导航守卫:token不存在不允许访问后台
router.beforeEach((to, from, next) => {
  //to将要访问的路径
  //from代表从哪个路径跳转而来
  //next是一个函数表示放行,next()放行,next('/login')强制跳转指定位置
  /* 
  1.如果前往登录页, 直接放行
  2.如果token为空，则导航回登录页
  3.除此之外，直接放行 
  */
  if (to.path === '/login') return next()
  if (!sessionStorage.getItem('token')) return next('/login')
  next()
})

export default router

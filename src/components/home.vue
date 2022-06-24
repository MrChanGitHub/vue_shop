<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <span>电商管理后台</span>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="asideWith">
        <!-- 折叠菜单 -->
        <div class="toggle-button" @click="isCollapse">ECMS</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          :collapse="collapse"
          router
          :default-active="activePath"
        >
          <el-submenu
            :index="String(item.id)"
            v-for="(item, index) in menuList"
            :key="item.id"
          >
            <!-- 一级菜单 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[index]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="String(menuItem.path)"
              v-for="menuItem in item.children"
              :key="menuItem.id"
              @click="saveNavState(String(menuItem.path))"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ menuItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      //左侧菜单数据
      menuList: [],

      //定义一级菜单图标数组遍历
      iconsObj: [
        'el-icon-user-solid',
        'el-icon-s-tools',
        'el-icon-s-goods',
        'el-icon-s-order',
        'el-icon-s-data',
      ],

      //控制菜单是否折叠的属性
      collapse: false,
      //控制折叠时el-aside的宽度
      asideWith: '200px',

      //被激活的链接地址
      activePath: '',
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
  },
  mounted() {},
  methods: {
    //退出功能：移除token返回login页面,待token重新生成之后允许访问
    logout() {
      sessionStorage.removeItem('token')
      this.$router.push('./login')
    },
    //获取所有的菜单数据
    async getMenuList() {
      const result = await this.$http.get('menus')
      if (result.data.meta.status !== 200)
        return this.$message.error(result.data.meta.msg)
      this.menuList = result.data.data
    },
    //控制菜单是否折叠
    isCollapse() {
      this.collapse = !this.collapse
      //控制折叠菜单的宽度
      if (this.collapse) {
        this.asideWith = '64px'
      } else {
        this.asideWith = '200px'
      }
    },

    //保存页面的激活状态
    saveNavState(activePath) {
      //保存在sessionStorage中是为了刷新页面时，仍能保存菜单栏链接的激活状态
      sessionStorage.setItem('activePath', activePath)
    },
  },
}
</script>

<style scoped lang="scss">
.el-header {
  background-color: #409eff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 30px;
  }
}
.el-aside {
  background-color: #545c64;
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
.el-menu {
  border-right: 0px;
}
.toggle-button {
  background-color: #4a5064;
  height: 25px;
  font-size: 15px;
  line-height: 25px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>

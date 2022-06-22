<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    //退出功能：移除token返回login,待token重新生成之后允许访问
    logout() {
      sessionStorage.removeItem('token')
      this.$router.push('./login')
    },
  },
}
</script>

<style scoped lang="scss"></style>

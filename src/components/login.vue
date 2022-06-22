<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="icon" />
      </div>
      <!-- 登录表单区域 -->
      <el-form class="login_form" :model="loginForm" :rules="rules" ref="loginForm">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="submitForm('loginForm')">登录</el-button>
          <el-button type="info" native-type="reset"  :plain="true" @click="resetForm('loginForm')">重置</el-button utton>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  components: {},
  props: {},
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 5, max: 12, message: '长度在 5 到 12 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ],
      },
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    //验证提交时信息内容是否符合要求
    submitForm(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const result = await this.$http.post('login',this.loginForm)
            if(result.data.meta.status === 200){
              this.$message({
              message: '登录成功',
              type: 'success'
              })
              //1.token只应在网站打开期间生效，所以应该保存在sessionStorage中
              sessionStorage.setItem('token',result.data.data.token)
              //2.通过编程式导航跳转到后台主页,路由地址/home
              this.$router.push('/home')
            }
            else{
              this.$message({
              message: '登录失败',
              type: 'error'
              })
            }
          }else {
            this.$message.error('请按要求输入信息校验');
            return false;
          }
        })
      },
    //重置表单内容,调用element-ui组件的resetFields完成信息重置和清除校验提示
    resetForm(formName) {
        this.$refs[formName].resetFields();
    },
  },
}
</script>

<style scoped lang="scss">
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.login_form {
  position: absolute;
  top: 35%;

  width: 100%;
}
.avatar_box {
  height: 130px;
  width: 130px;
  padding: 10px;
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgb(248, 248, 248);
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>

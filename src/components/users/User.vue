<template>
  <div>
    <!-- 面包屑导航区 -->
    <!-- :to导航到指定路径,按路由命名 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <!-- 
        :gutter指定栅格之间的间隔
        :span栅格占据的列数
       -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        </el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <!-- 
        label:指定列标题
        :data指定表格的数据源，自动做遍历展示
        prop指定数据源中对应的命名展示数据
        type="index"：根据行数量自动添加序号
      -->
      <el-table :data="userList" border stripe>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <!-- 作用域插槽 -->
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChange(scope.row)"
                >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <!-- 修改按钮 -->
              <el-tooltip class="item" effect="dark" content="修改角色" placement="top" :enterable="false" >
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
              </el-tooltip>
              
              <!-- 分配角色 -->
              <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting"></el-button>
              </el-tooltip>
              
              <!-- 删除角色 -->
              <el-tooltip class="item" effect="dark" content="删除角色" placement="top" :enterable="false">
                <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加"
      :visible.sync="addUserDialogVisible"
      width="30%"
      @close="addDialogClosed()"
      >
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->
    <el-dialog
      title="修改"
      :visible.sync="updateUserDialogVisible"
      width="30%"
      @close="editDialogClosed()">
      <!-- 内容主体区 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">修 改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    //自定义验证邮箱规则
    var checkEmail = (rule,value,callback)=>{
      const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if(regEmail.test(value)){
        //合法邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    //自定义验证手机规则
    var checkMobile = (rule,value,callback)=>{
      const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/
      if(regMobile.test(value)){
        //合法手机号
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }

    return {
      //获取用户列表的参数对象
      queryInfo:{
        query:'',

        //当前的页数
        pagenum:1,
        //每页显示的数据量
        pagesize:5,
      },
      userList:[],
      total:0,

      //控制添加用户对话框的显示与隐藏
      addUserDialogVisible:false,
      //控制修改用户信息对话框的显示与隐藏
      updateUserDialogVisible:false,

      //添加用户的表单数据
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:'',
      },
      //添加表单的验证规则对象
      addFormRules:{
        username:[
          {required:true,message:"请输入用户名",trigger:'blur'},
          {min:5,max:12,message:"用户名的长度在长度5~12个字符之间",trigger:'blur'}
        ],
        password:[
          {required:true,message:"请输入密码",trigger:'blur'},
          {min:6,max:16,message:"密码的长度在长度6~16个字符之间",trigger:'blur'}
        ],
        email:[
          {required:true,message:"请输入邮箱",trigger:'blur'},
          {validator:checkEmail, trigger: 'blur'}
        ],
        mobile:[
          {required:true,message:"请输入手机号",trigger:'blur'},
          {validator:checkMobile,trigger:'blur'}
        ]
      },
      //查询到的用户信息对象
      editForm:{},

      //修改表单的验证规则对象
      editFormRules:{
        email:[
          {required:true,message:"请输入邮箱",trigger:'blur'},
          {validator:checkEmail, trigger: 'blur'}
        ],
        mobile:[
          {required:true,message:"请输入手机号",trigger:'blur'},
          {validator:checkMobile,trigger:'blur'}
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getUserList()
  },
  mounted() {},
  methods: {
    //请求用户数据
    async getUserList(){
      const {data:res} = await this.$http.get('users',{params:this.queryInfo})
      if(res.meta.status!==200) return this.$message.error('获取用户列表失败！')
      this.userList = res.data.users
      this.total = res.data.total
    },
    
    //监听pagesie改变的事件
    handleSizeChange(newSize){
      //修改每页显示的数据量
      this.queryInfo.pagesize = newSize
      //上述状态改变后，重新请求数据适应当前页数据量
      this.getUserList()
    },

    //监听页面值改变的事件
    handleCurrentChange(newPage){
      //修改当前页
      this.queryInfo.pagenum = newPage
      //上述状态改变后，重新请求数据适应当前页对应的数据
      this.getUserList()
    },

    //监听switch开关状态的改变
    async userStateChange(userInfo){
      const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if(res.meta.status!==200){
        //更新失败,则不允许改变状态值
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('更新状态成功')
    },

    //监听添加用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },

    //添加用户事件
    addUserInfo(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return this.$message.error('请按表单项要求添加信息')
        //校验通过后发起请求
        const {data:res} = await this.$http.post('users',this.addForm)
        if(res.meta.status!==201) return this.$message.error('添加用户失败')
        //添加用户成功后,重新请求用户数据，关闭dialog对话框,弹出成功提示
        this.getUserList()
        this.addUserDialogVisible = false
        this.$message.success('添加用户成功')
      })
    },

    //展示编辑用户的对话框
    async showEditDialog(id){
      //根据id请求数据
      const {data:res} = await this.$http.get(`users/${id}`)
      if(res.meta.status!==200){
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      //展开对话框
      this.updateUserDialogVisible =true
    },
    
    //监听修改用户对话框的关闭事件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },

    //修改用户信息并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return this.$message.error('请按表单项要求修改信息')
        //发起修改用户的请求
        const {data:res} = await this.$http.put('users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
        if(res.meta.status!=200) return this.$message.error('修改失败')
        //修改用户信息成功后,重新请求用户数据，关闭dialog对话框,弹出成功提示
        this.getUserList()
        this.updateUserDialogVisible = false
        this.$message.success('修改成功')
      })
    },

    //删除用户信息事件
    async removeUserById(id){
       const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', 
       {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
       }).catch(err=>err)

       //如果用户取消了删除,则则confirmResult返回值位字符串cancel
       if(confirmResult==='cancel'){
          return this.$message.info('取消删除')
       }
       
       //如果用户确认删除，则confirmResult返回值位字符串confirm
       //发起网络请求，删除用户信息,更新数据,弹出提示框
       const {data:res} = await this.$http.delete(`users/${id}`)
       if(res.meta.status!==200) return this.$message.error('删除失败')
       this.getUserList()
       this.$message.success('删除成功')
    }
  },
}
</script>

<style scoped lang="scss">
.el-card {
  margin-top: 10px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.el-table{
  margin-top: 15px;
  font-size:14px;
}
.el-pagination{
  margin-top: 15px;
}

</style>

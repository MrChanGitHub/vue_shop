<template>
  <div>
    <!-- 面包屑导航区 -->
    <!-- :to导航到指定路径,按路由命名 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog()"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 三方库tree-table-with-tree-grid -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treeTable"
      >
        <!-- 列：是否有效 -->
        <template v-slot:isOk="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: #67c23a"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else-if="scope.row.cat_level === 2"
            >三级</el-tag
          >
        </template>

        <!-- 操作 -->
        <template v-slot:operation="scope">
          <el-button
            type="warning"
            icon="el-icon-edit"
            @click="selectCateById(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="30%"
      @close="resetData()"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" prop="">
          <!-- options指定数据源 -->
          <!-- props指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged()"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="30%"
    >
      <!-- 修改分类的表单 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
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
    return {
      //查询条件对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },

      //商品分类的数据列表
      cateList: [],

      //总数据条数
      total: 0,

      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这列使用模板的名称
          template: 'isOk',
        },
        {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这列使用模板的名称
          template: 'order',
        },
        {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这列使用模板的名称
          template: 'operation',
        },
      ],

      //控制添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      //控制修改分类对话框显示与隐藏
      editCateDialogVisible: false,

      //添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类的名称
        cat_name: '',
        //父类分类的id
        cat_pid: 0,
        //默认添加一级分类
        cat_level: 0,
      },

      //添加分类表单的验证对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
        ],
      },

      //父级分类的数据列表
      parentCateList: [],

      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },

      //选中的父级分类的id数组
      selectedKeys: [],

      //修改菜单对象
      editCateForm: {
        cat_name: '',
      },

      //修改分类校验规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
        ],
      },

      //保存修改分类的id(用于修改操作)
      editCateId: 0,
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getCateList()
  },
  mounted() {},
  methods: {
    //请求商品分类的所有数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },

    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    //添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表，再展示对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },

    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.parentCateList = res.data
    },

    //联级选择项发生改变时触发事件
    parentCateChanged() {
      //如果selectedKeys数组length大于0，说明父级分类被选中,将数组中最后一个父级类别赋值
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
      }
      //数据库中level 0 代表1级，1代表2级，2代表3级
      this.addCateForm.cat_level = this.selectedKeys.length
    },

    //添加分类对话框退出时重置数据
    resetData() {
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_name = ''
      this.selectedKeys = []
    },

    //添加分类请求
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm,
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.getCateList()
        this.addCateDialogVisible = false
        this.$message.success('添加分类成功')
      })
    },

    //根据id查询分类
    async selectCateById(id) {
      this.editCateId = id
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询失败')
      }
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateDialogVisible = true
    },
    //修改分类名称
    async editCate() {
      const { data: res } = await this.$http.put(
        `categories/${this.editCateId}`,
        { cat_name: this.editCateForm.cat_name },
      )
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.getCateList()
      this.editCateDialogVisible = false
      this.$message.success('修改成功')
    },

    //根据id删除分类
    async removeCateById(id) {
      //弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).catch((err) => err)

      //如果用户取消了删除,则则confirmResult返回值位字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }

      //如果用户确认删除，则confirmResult返回值位字符串confirm
      //发起网络请求，删除用户信息,更新数据,弹出提示框
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.getCateList()
      this.$message.success('删除成功')
    },
  },
}
</script>

<style scoped lang="scss">
.el-card {
  margin-top: 15px;
}
.treeTable,
.el-pagination {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>

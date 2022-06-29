<template>
  <div>
    <!-- 面包屑导航区 -->
    <!-- :to导航到指定路径,按路由命名 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col style="margin-top: 15px">
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handlecChange()"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 扩展列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态参数的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 扩展列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数和静态属性的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClosed()"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed()"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
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
      //商品分类列表
      cateList: [],

      //级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },

      //级联选择框双向绑定到的数组
      selectedCateKeys: [],

      //默认被激活页签的名字
      activeName: 'many',

      //动态参数的数据
      manyTableData: [],
      //静态参数的数据
      onlyTableData: [],

      //控制添加对话框的显示与隐藏
      addDialogVisible: false,

      //控制修改对话框的显示与隐藏
      editDialogVisible: false,

      //添加参数表单数据
      addForm: {
        attr_name: '',
      },

      //添加参数表单校验规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }],
      },

      //修改参数表单数据
      editForm: {},

      //修改参数表单校验规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }],
      },

      //当前需要修改的attr_id
      currentAttr_Id: '',

      //控制标签按钮与文本框的切换显示
      inputVisible: false,

      //文本框中输入的内容
      inputValue: '',
    }
  },
  computed: {
    //根据级联选择框的是否选中三级分类来决定按钮是否启用
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3 ? true : false
    },

    //当前选中的三级分类id
    cateId() {
      return this.selectedCateKeys.length === 3
        ? this.selectedCateKeys[2]
        : null
    },

    //动态返回标题
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
  watch: {},
  created() {
    this.getCateList()
  },
  mounted() {},
  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },

    //级联选择框选中项的变化触发该函数
    handlecChange() {
      this.getParamsData()
    },

    //tab页点击事件的处理函数
    handleClick() {
      this.getParamsData()
    },

    //获取参数的列表数据
    async getParamsData() {
      //如果选中的不是三级分类则不做处理
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      //根据所选分类的id和当前所处的面案，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } },
      )
      if (res.meta.status !== 200) return this.$message.error('获取列表失败')

      //Tab标签原数据是由一串带空格的多个值组成,这里需要做一下分割，然后遍历数组展示Tab标签
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        //控制文本框的显示与隐藏
        item.inputVisible = false
        //文本框中输入的值
        item.inputValue = ''
      })

      //判断获取的数据是动态参数还是静态参数,many or only
      if (this.activeName === 'many') {
        return (this.manyTableData = res.data)
      } else {
        return (this.onlyTableData = res.data)
      }
    },

    //添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          },
        )
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.getParamsData()
        this.addDialogVisible = false
        this.$message.success('添加参数成功')
      })
    },

    //添加参数对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    //编辑参数对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    //查询attr_name信息绑定input
    async showEditDialog(attrId) {
      //查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } },
      )
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },

    //修改参数操作
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          },
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        this.getParamsData()
        this.editDialogVisible = false
        this.$message.success('修改参数成功')
      })
    },

    //删除参数(根据id)
    async removeParamsById(attrId) {
      //弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
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
      const { data: res } = await this.$http
        .delete(`categories/${this.cateId}/attributes/${attrId}
`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.getParamsData()
      this.$message.success('删除成功')
    },

    //标签文本框事件(失去焦点/按下Enter健)
    async handleInputConfirm(row) {
      //判断用户输入的数据是否符合基本要求
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = true
        return
      }

      //执行添加Tab标签操作
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //发起网络请求存储数据
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          //数据库接收的是字符串类型,之前拆分Tab标签更改为数组类型,因此需要转回字符串
          attr_vals: row.attr_vals.join(','),
        },
      )

      if (res.meta.status !== 200)
        return this.$message.error('添加标签属性失败')
      this.$message.success('添加标签属性成功')
    },

    //展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //当元素被重新渲染之后执行回调函数中的代码
      this.$nextTick((_) => {
        //让文本框自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    //删除对应的标签参数
    async handleClose(index, row) {
      const confirmResult = await this.$confirm('确认删除标签?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)

      //如果用户取消了删除,则则confirmResult返回值位字符串cancel
      if (confirmResult !== 'confirm') {
        return
      }
      row.attr_vals.splice(index, 1)
      //发起网络请求存储数据
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          //数据库接收的是字符串类型,之前拆分Tab标签更改为数组类型,因此需要转回字符串
          attr_vals: row.attr_vals.join(','),
        },
      )
      if (res.meta.status !== 200)
        return this.$message.error('删除标签属性失败')
      this.$message.success('删除标签属性成功')
    },
  },
}
</script>

<style scoped lang="scss">
.el-card,
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>

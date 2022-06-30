<template>
  <div>
    <!-- :to导航到指定路径,按路由命名 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0"
            >基本信息
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框区域 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="checkbox"
                  v-for="(checkbox, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              :headers="headerObj"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" @click="addGoods"
              >已填写全部信息,添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="40%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      //激活el-tab-pane
      activeIndex: '0',
      //添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],

        //动态参数和静态属性数组
        attrs: [],

        //商品的描述详情
        goods_introduce: '',
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },

      //分类数据
      cateList: [],

      //商品分类列表
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },

      //动态参数列表数组
      manyTableData: [],

      //静态属性列表数组
      onlyTableData: [],

      //图片上传组件的请求头对象,组件自己封装的ajax没有携带token因此需要手动添加请求头
      headerObj: {
        Authorization: sessionStorage.getItem('token'),
      },

      //处理图片预览时的url地址数据
      previewPath: '',

      //控制图片预览对话框的显示与隐藏
      previewVisible: false,
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    },
  },
  watch: {},
  created() {
    this.getCateList()
  },
  mounted() {},
  methods: {
    //请求商品分类的所有数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.cateList = res.data
    },

    //级联选择器发生变化时触发
    handleChange() {
      //限制:必须选择三级分类,否则清空数据
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.warning('请选择三级分类')
        this.addForm.goods_cat.length = []
      }
    },

    //切换标签页之前的校验
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },

    //标签页点击事件
    async tabClicked() {
      //判断访问的是否为动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' },
          },
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }

        //在赋值之前将attr_vals的字符串以逗号分割为数组
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      }

      //判断访问的是否为静态属性面板
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' },
          },
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数列表失败')
        }
        this.onlyTableData = res.data
      }
    },

    //处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    //移除图片的处理函数
    handleRemove(file) {
      //1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      //2.从pics数组中,找到这个图片对应的索引值然后调用splice方法,从pics数组中移除该图片数据
      const picIndex = this.addForm.pics.findIndex((x) => {
        x.pic === filePath
      })
      this.addForm.pics.splice(picIndex, 1)
      this.$message.warning('图片已移除')
    },

    //上传图片成功的处理函数
    handleUploadSuccess(response) {
      //上传图片成功后会返回response对象里面包含图片的临时路径等数据
      //1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //2.将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo)
      this.$message.success('图片上传成功')
    },

    //添加商品
    async addGoods() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
      })

      //请求的数据中goods_cat需要是字符串类型,由于级联选择器又需要的是数组类型,因此无法对原数据进行调整,故通过lodash库来实现深拷贝
      const newForm = _.cloneDeep(this.addForm)
      newForm.goods_cat = newForm.goods_cat.join(',')

      //处理动态参数
      this.manyTableData.forEach((item) => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(','),
        }
        newForm.attrs.push(newInfo)
      })

      //处理静态参数
      this.onlyTableData.forEach((item) => {
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
        newForm.attrs.push(newInfo)
      })

      //发送请求添加商品
      const { data: res } = await this.$http.post('goods', newForm)
      if (res.meta.status !== 201) {
        console.log(res)
        return this.$message.error(res.meta.msg)
      }

      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    },
  },
}
</script>

<style scoped lang="scss">
.el-steps {
  margin: 15px auto;
  margin-left: 15%;
}

.el-form-item__content {
  margin-left: 0px !important;
}

.el-checkbox {
  margin: 0 5px 0 0;
}
.previewImg {
  width: 100%;
}
</style>

<template>
  <div>
    <!-- :to导航到指定路径,按路由命名 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
            @clear="getGoodsList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage()">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column
          label="商品名称"
          prop="goods_name"
          width="800px"
        ></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="110px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="80px"
        ></el-table-column>
        <!-- 数据是时间戳，通过全局过滤器转换为日期格式 -->
        <el-table-column label="创建时间" prop="add_time">
          <template v-slot="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeById(scope.row.goods_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      //查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },

      //商品列表
      goodsList: [],

      //总数据条数
      total: 0,
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getGoodsList()
  },
  mounted() {},
  methods: {
    //根据分页获取对应的数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('请求商品信息失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },

    //分页显示条数量发生改变时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //分页页码发生改变时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    //删除商品
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).catch((err) => err)

      //如果用户取消了删除,则则confirmResult返回值位字符串cancel
      if (confirmResult !== 'confirm') {
        return
      }

      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },

    //添加商品跳转路由
    goAddPage() {
      this.$router.push('/AddGoods')
    },
  },
}
</script>

<style scoped lang="scss"></style>

<template>
  <div>
    <!-- :to导航到指定路径,按路由命名 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为echarts准备一个具备大小(宽高)的DOM -->
      <div id="main"></div>
    </el-card>
  </div>
</template>

<script>
//1.导入echarts
import * as echarts from 'echarts'
import _ from 'lodash'
// 绘制图表

export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      option: {
        title: {
          text: '用户来源',
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子'],
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '销量',
            type: 'line',
            data: [5, 20, 36, 10, 10, 20],
          },
        ],
      },
    }
  },
  computed: {},
  watch: {},
  created() {},
  async mounted() {
    //2.此时页面元素已经被渲染完毕,操作DOM初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    //3.准备数据和配置项
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200)
      return this.$message.error('获取折线图数据失败')

    const result = _.merge(res.data, this.option)

    //4.展示数据
    myChart.setOption(result)
  },
  methods: {},
}
</script>

<style scoped lang="scss">
#main {
  width: 1400px;
  height: 600px;
}
</style>

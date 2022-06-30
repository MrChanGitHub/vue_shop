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
    <el-card>
      <!-- 添加区域 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="item in scope.row.children"
              :key="item.id"
              class="bottomBorder vCenter"
              :gutter="20"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6"
                ><el-tag
                  closable
                  @close="removeRightById(scope.row, item.id)"
                  >{{ item.authName }}</el-tag
                ><i class="el-icon-caret-right"></i
              ></el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="20">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  v-for="item2 in item.children"
                  :key="item2.id"
                  class="bottomBorder vCenter"
                >
                  <el-col :span="10">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    ><i class="el-icon-caret-right" />
                  </el-col>
                  <el-col>
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
              <!-- 渲染三级权限 -->
              <el-col></el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row.id)"
              >编辑</el-button
            >
            <!-- 分配按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加"
      :visible.sync="addRoleDialogVisible"
      width="30%"
      @close="addRoleDialogClosed()"
    >
      <!-- 内容主体区 -->
      <el-form :model="addRoleForm" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles()">修 改</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="编辑"
      :visible.sync="editRoleDialogVisible"
      width="30%"
      @close="editRoleDialogClosed()"
    >
      <!-- 内容主体区 -->
      <el-form :model="editRoleForm" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="权限列表"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="clearDefKey()"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        :default-checked-keys="defKeys"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="rightsTreeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRights()">确 定</el-button>
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
      //所有角色的列表数据
      roleList: [],

      //所有权限的数据
      rightsList: [],

      //树型控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },

      //默认选中的节点id数组
      defKeys: [],

      //当前即将分配权限的id
      roleId: '',

      //添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },

      //修改角色的表单数据
      editRoleForm: {},

      //控制添加角色对话框显示与否
      addRoleDialogVisible: false,
      //控制编辑角色对话框显示与否
      editRoleDialogVisible: false,
      //控制分配权限对话框显示与否
      setRightDialogVisible: false,
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getRolesList()
  },
  mounted() {},
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },

    //添加角色事件
    async addRoles() {
      const { data: res } = await this.$http.post('roles', this.addRoleForm)
      if (res.meta.status != 201) return this.$message.error('添加失败')
      this.getRolesList()
      this.addRoleDialogVisible = false
      this.$message.success('添加成功')
    },

    //监听添加角色对话框关闭事件
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },

    //监听编辑角色对话框关闭事件
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },

    //查询角色信息
    async editRole(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },

    //修改角色信息事件
    async editRoles() {
      //发起修改用户的请求
      const { data: res } = await this.$http.put(
        'roles/' + this.editRoleForm.roleId,
        {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        },
      )
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      //修改用户信息成功后,重新请求用户数据，关闭dialog对话框,弹出成功提示
      this.getRolesList()
      this.editRoleDialogVisible = false
      this.$message.success('修改成功')
    },

    //删除角色事件
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).catch((err) => err)

      //如果用户取消了删除,则则confirmResult返回值位字符串cancel
      if (confirmResult === 'cancel') {
        return this.$message.info('取消删除')
      }

      //如果用户确认删除，则confirmResult返回值位字符串confirm
      //发起网络请求，删除用户信息,更新数据,弹出提示框
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.getRolesList()
      this.$message.success('删除成功')
    },

    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`,
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      //这里如果用getRoleList会刷新页面把展开的界面再次隐藏体验不佳，这里res.data是删除后最新的数据，因此直接重新赋值避免页面刷新
      role.children = res.data
      this.$message.success('删除成功')
    },

    //展示分配权限对话框的事件
    async showSetRightDialog(role) {
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.rightsList = res.data
      //递归获取三级节点的ID
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true

      //为修改角色分配做赋值准备
      this.roleId = role.id
    },

    //通过递归的形式，获取角色下所有三级权限的id
    getLeafKeys(node, arr) {
      //如果当前node节点不包含children属性，则属于三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },

    //清空保存角色对应权限的临时数据，保证每个角色权限显示无误
    clearDefKey() {
      this.defKeys = []
    },

    //修改角色权限分配
    async editRights() {
      const keys = [
        //getCheckedKeys方法是tree控件获取被勾选节点(三级节点)key值的数组
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        //getHalfCheckKeys方法是tree控件获取被半勾选节点(一级节点、二级节点)key值的数组
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys(),
      ]
      //以下要求按照API接口参数列表数据类型设置
      const idStr = keys.join(',')

      //发起修改请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr },
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')

      //重新请求最新数据
      this.getRolesList()
      this.setRightDialogVisible = false
      this.$message.success('分配权限成功')
    },
  },
}
</script>

<style scoped lang="scss">
.el-tag {
  margin: 7px;
}
.bottomBorder {
  border-bottom: 1px solid #eee;
}
.vCenter {
  display: flex;
  align-items: center;
}
.el-col {
  margin-left: 30px;
}
</style>

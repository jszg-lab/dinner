import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, Shield, UserCheck, UserX, Plus, Upload, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { getRoleName, getRoleColor, formatDate } from '../utils/formatters.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';

export default function UserManagementPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBatchAddModal, setShowBatchAddModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const userData = userService.getAllUsers();
    const deptData = userService.getAllDepartments();
    setUsers(userData);
    setDepartments(deptData);
    setLoading(false);
  };

  const handleRoleChange = (userId, newRole) => {
    if (window.confirm(`确定要将该用户设置为"${getRoleName(newRole)}"吗？`)) {
      userService.updateUserRole(userId, newRole);
      loadData();
    }
  };

  const handleDeptChange = (userId, departmentId) => {
    userService.updateUserDepartment(userId, departmentId || null);
    loadData();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('确定要删除该用户吗？此操作不可撤销。')) {
      try {
        userService.deleteUser(userId);
        loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleAddDepartment = (name) => {
    try {
      userService.createDepartment(name);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteDepartment = (deptId) => {
    if (window.confirm('确定要删除该部门吗？')) {
      try {
        userService.deleteDepartment(deptId);
        loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">请先登录</p>
        <Link to="/login" className="text-primary hover:underline">前往登录</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">您没有权限访问此页面</p>
        <Link to="/" className="text-primary hover:underline">返回首页</Link>
      </div>
    );
  }

  const filteredUsers = filterDept 
    ? users.filter(u => u.departmentId === filterDept)
    : users;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">用户管理</h1>
        <p className="text-text-secondary">
          管理系统用户，设置用户角色和部门
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary">{users.length}</div>
              <div className="text-sm text-text-secondary">总用户数</div>
            </div>
            <UsersIcon className="w-10 h-10 text-primary/30" />
          </div>
        </Card>
        <Card hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary">{departments.length}</div>
              <div className="text-sm text-text-secondary">部门数量</div>
            </div>
            <Building2 className="w-10 h-10 text-secondary/30" />
          </div>
        </Card>
        <Card hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.role === 'organizer').length}
              </div>
              <div className="text-sm text-text-secondary">组织者数量</div>
            </div>
            <UserCheck className="w-10 h-10 text-success/30" />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setShowAddUserModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
        <Button variant="secondary" onClick={() => setShowBatchAddModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          批量添加
        </Button>
        <Button variant="outline" onClick={() => setShowDeptModal(true)}>
          <Building2 className="w-4 h-4 mr-2" />
          部门管理
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">全部部门</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-text-secondary">
            加载中...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">昵称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">角色</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">部门</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">注册时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-text-primary">{user.nickname}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.departmentId || ''}
                        onChange={(e) => handleDeptChange(user.id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={user.role === 'admin'}
                      >
                        <option value="">未分配</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleRoleChange(user.id, 'organizer')}
                              className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              组织者
                            </button>
                            <button
                              onClick={() => handleRoleChange(user.id, 'member')}
                              className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              成员
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              删除
                            </button>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-xs text-text-secondary">系统管理员</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddUserModal
        visible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          setShowAddUserModal(false);
          loadData();
        }}
        departments={departments}
      />

      <BatchAddModal
        visible={showBatchAddModal}
        onClose={() => setShowBatchAddModal(false)}
        onSuccess={() => {
          setShowBatchAddModal(false);
          loadData();
        }}
        departments={departments}
      />

      <DepartmentModal
        visible={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        departments={departments}
        onAdd={handleAddDepartment}
        onDelete={handleDeleteDepartment}
      />
    </div>
  );
}

function AddUserModal({ visible, onClose, onSuccess, departments }) {
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    role: 'member',
    departmentId: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      userService.addUser(
        formData.nickname,
        formData.password,
        formData.role,
        formData.departmentId || null
      );
      setFormData({ nickname: '', password: '', role: 'member', departmentId: '' });
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal visible={visible} title="添加用户" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="昵称"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          placeholder="至少2个字符"
          required
        />

        <Input
          label="密码"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="至少6个字符"
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">角色</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="member">普通成员</option>
            <option value="organizer">聚餐组织者</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">部门</label>
          <select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">不分配部门</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>取消</Button>
          <Button type="submit">添加用户</Button>
        </div>
      </form>
    </Modal>
  );
}

function BatchAddModal({ visible, onClose, onSuccess, departments }) {
  const [text, setText] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = () => {
    if (!text.trim()) {
      alert('请输入用户数据');
      return;
    }

    setLoading(true);
    const lines = text.trim().split('\n');
    const usersData = lines.map(line => {
      const parts = line.split(/[,\t，]/).map(p => p.trim());
      return {
        nickname: parts[0] || '',
        password: parts[1] || '123456',
        role: 'member',
        departmentId: departmentId || null,
      };
    }).filter(u => u.nickname);

    try {
      const res = userService.addUsersBatch(usersData);
      setResult(res);
      if (res.success > 0) {
        setTimeout(() => {
          setText('');
          setResult(null);
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} title="批量添加用户" onClose={onClose} size="lg">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700 mb-2">格式说明：</p>
        <p className="text-xs text-blue-600">每行一个用户，格式：昵称,密码</p>
        <p className="text-xs text-blue-600">密码可选，默认为 123456</p>
        <pre className="mt-2 text-xs bg-blue-100 p-2 rounded">
{`张三,abc123
李四,xyz789
王五`}
        </pre>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">分配部门</label>
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">不分配部门</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="粘贴用户数据..."
        rows={8}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
      />

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.success > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-medium ${result.success > 0 ? 'text-green-700' : 'text-red-700'}`}>
            成功添加 {result.success} 个用户
          </p>
          {result.failed > 0 && (
            <div className="mt-2 text-sm text-red-600">
              {result.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose}>取消</Button>
        <Button onClick={handleImport} loading={loading}>批量添加</Button>
      </div>
    </Modal>
  );
}

function DepartmentModal({ visible, onClose, departments, onAdd, onDelete }) {
  const [newDeptName, setNewDeptName] = useState('');

  const handleAdd = () => {
    if (!newDeptName.trim()) return;
    onAdd(newDeptName.trim());
    setNewDeptName('');
  };

  return (
    <Modal visible={visible} title="部门管理" onClose={onClose}>
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="输入部门名称"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Button onClick={handleAdd}>添加</Button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {departments.map(dept => (
          <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-text-primary">{dept.name}</span>
            <button
              onClick={() => onDelete(dept.id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {departments.length === 0 && (
          <p className="text-center text-text-secondary py-4">暂无部门</p>
        )}
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose}>关闭</Button>
      </div>
    </Modal>
  );
}

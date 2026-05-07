import { useState } from 'react';
import { Plus, X, Edit2, Trash2, User, Upload, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Users = () => {
  const { currentUser, users, departments, addUser, updateUser, deleteUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    role: 'member',
    department_id: ''
  });

  if (!currentUser || !['super_admin', 'dept_admin'].includes(currentUser.role)) {
    window.location.href = '/';
    return null;
  }

  const filteredUsers = users.filter(user => 
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nickname.trim()) return;

    const data = {
      ...formData,
      password: formData.password.trim() || '123456'
    };

    if (editingUser) {
      updateUser(editingUser.id, data);
    } else {
      addUser(data);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      nickname: '',
      password: '',
      role: 'member',
      department_id: currentUser.department_id
    });
    setEditingUser(null);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      nickname: user.nickname,
      password: '',
      role: user.role,
      department_id: user.department_id
    });
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    if (userId === currentUser.id) {
      alert('不能删除自己');
      return;
    }
    if (window.confirm('确定要删除这个用户吗？')) {
      deleteUser(userId);
    }
  };

  const handleBatchAdd = () => {
    if (!batchText.trim()) return;
    
    const lines = batchText.trim().split('\n');
    let successCount = 0;
    
    lines.forEach(line => {
      const parts = line.split(',');
      const nickname = parts[0]?.trim();
      const password = parts[1]?.trim() || '123456';
      
      if (nickname) {
        addUser({
          nickname,
          password,
          role: 'member',
          department_id: currentUser.department_id
        });
        successCount++;
      }
    });

    alert(`成功添加 ${successCount} 个用户`);
    setBatchText('');
    setShowBatchModal(false);
  };

  const getDepartmentName = (id) => {
    const dept = departments.find(d => d.id === id);
    return dept?.name || '-';
  };

  const getRoleLabel = (role) => {
    const roles = {
      super_admin: '超级管理员',
      dept_admin: '部门管理员',
      organizer: '组织者',
      member: '成员'
    };
    return roles[role] || role;
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
          <p className="text-gray-500 mt-1">管理系统用户</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>批量添加</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加用户</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户昵称..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">昵称</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">角色</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">部门</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">创建时间</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="font-medium text-gray-800">{user.nickname}</span>
                      {user.id === currentUser.id && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">自己</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'super_admin' ? 'bg-red-100 text-red-600' :
                      user.role === 'dept_admin' ? 'bg-purple-100 text-purple-600' :
                      user.role === 'organizer' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{getDepartmentName(user.department_id)}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{user.created_at}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">没有找到用户</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingUser ? '编辑用户' : '添加用户'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称 *</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入昵称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={editingUser ? '留空则保持不变' : '默认为 123456'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="member">成员</option>
                  <option value="organizer">组织者</option>
                  <option value="dept_admin">部门管理员</option>
                  {currentUser.role === 'super_admin' && (
                    <option value="super_admin">超级管理员</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingUser ? '保存修改' : '添加用户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">批量添加用户</h2>
              <button
                onClick={() => { setShowBatchModal(false); setBatchText(''); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">用户列表</label>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={8}
                placeholder="格式：每行一个用户，昵称,密码&#10;密码可选，默认为 123456&#10;&#10;示例：&#10;张三,abc123&#10;李四,xyz789&#10;王五"
              />
              <p className="text-sm text-gray-500 mt-2">用户将添加到您所在的部门</p>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => { setShowBatchModal(false); setBatchText(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchAdd}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  批量添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Users;

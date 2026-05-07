import { useState } from 'react';
import { Plus, X, Trash2, Building, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Departments = () => {
  const { currentUser, departments, addDepartment, deleteDepartment, getDepartmentUsers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  if (!currentUser || currentUser.role !== 'super_admin') {
    window.location.href = '/';
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addDepartment(formData);
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleDelete = (departmentId) => {
    const usersInDept = getDepartmentUsers(departmentId);
    if (usersInDept.length > 0) {
      alert(`该部门有 ${usersInDept.length} 名用户，请先转移用户`);
      return;
    }
    if (window.confirm('确定要删除这个部门吗？')) {
      deleteDepartment(departmentId);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">部门管理</h1>
          <p className="text-gray-500 mt-1">管理系统部门</p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加部门</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => {
          const userCount = getDepartmentUsers(dept.id).length;
          return (
            <div key={dept.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                    <p className="text-sm text-gray-500">{dept.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{userCount} 名成员</span>
              </div>
            </div>
          );
        })}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">暂无部门</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            创建第一个部门
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">添加部门</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入部门名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入部门描述"
                />
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
                  添加部门
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Departments;

import { useState } from 'react';
import { Utensils, Users, BarChart3, Clock, CheckCircle, XCircle, Key, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Home = () => {
  const { currentUser, getDepartmentVotes, getDepartmentUsers, getDepartmentById, restaurants, votes, updateUser } = useApp();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  const department = getDepartmentById(currentUser.department_id);
  const departmentVotes = getDepartmentVotes(currentUser.department_id);
  const departmentUsers = getDepartmentUsers(currentUser.department_id);
  
  const activeVotes = departmentVotes.filter(v => v.status === 'active');
  const completedVotes = departmentVotes.filter(v => v.status === 'completed');

  const userParticipation = activeVotes.map(vote => {
    const participant = vote.participants.find(p => p.user_id === currentUser.id);
    return {
      ...vote,
      participated: !!participant?.participating,
      voted: !!participant?.restaurant_id
    };
  });

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('请输入当前密码');
      return;
    }

    if (passwordForm.currentPassword !== currentUser.password) {
      setPasswordError('当前密码不正确');
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError('请输入新密码');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码至少需要6位');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    updateUser(currentUser.id, { password: passwordForm.newPassword });
    alert('密码修改成功');
    setShowChangePasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">餐厅总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{restaurants.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Utensils className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">部门人数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{departmentUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">进行中投票</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeVotes.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成投票</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{completedVotes.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">我的投票状态</h2>
          
          {activeVotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无进行中的投票</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userParticipation.map(vote => (
                <div key={vote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{vote.title}</p>
                    <p className="text-sm text-gray-500">{vote.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {vote.participated ? (
                      <span className="flex items-center space-x-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>{vote.voted ? '已投票' : '已确认参与'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-red-500 text-sm">
                        <XCircle className="w-4 h-4" />
                        <span>未参与</span>
                      </span>
                    )}
                    <a href={`/votes/${vote.id}`} className="text-orange-500 hover:text-orange-600 text-sm">
                      查看详情
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快速操作</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/restaurants"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Utensils className="w-10 h-10 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">浏览餐厅</span>
            </a>
            {(currentUser.role === 'admin' || currentUser.role === 'organizer') && (
              <a
                href="/votes/create"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="w-10 h-10 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">发起投票</span>
              </a>
            )}
            <a
              href="/archives"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="w-10 h-10 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">历史记录</span>
            </a>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Key className="w-10 h-10 text-gray-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">修改密码</span>
            </button>
            {currentUser.role === 'admin' && (
              <a
                href="/users"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-10 h-10 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">用户管理</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">修改密码</h2>
              <button
                onClick={() => { setShowChangePasswordModal(false); setPasswordError(''); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-4 space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">当前密码 *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入当前密码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码 *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码 *</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowChangePasswordModal(false); setPasswordError(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  确认修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Home;

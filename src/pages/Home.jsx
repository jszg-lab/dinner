import { useState } from 'react';
import { Utensils, Users, BarChart3, Clock, CheckCircle, XCircle, Key, X, Calendar, ThumbsUp, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Home = () => {
  const { currentUser, getDepartmentVotes, getDepartmentUsers, getDepartmentById, restaurants, votes, updateUser, getUserRecommendations } = useApp();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showRecDetailModal, setShowRecDetailModal] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const openRecDetail = (rec) => {
    setSelectedRec(rec);
    setShowRecDetailModal(true);
    const viewedRecs = JSON.parse(localStorage.getItem('viewedRecommendations') || '[]');
    if (!viewedRecs.includes(rec.id)) {
      viewedRecs.push(rec.id);
      localStorage.setItem('viewedRecommendations', JSON.stringify(viewedRecs));
    }
  };

  const closeRecDetail = () => {
    setShowRecDetailModal(false);
    setSelectedRec(null);
  };

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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">待参与聚餐</h2>
          
          {(() => {
            const upcomingDinners = departmentVotes.filter(vote => {
              if (!vote.dinner_date) return false;
              const dinnerDate = new Date(vote.dinner_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dinnerDate.setHours(0, 0, 0, 0);
              const participant = vote.participants?.find(p => p.user_id === currentUser.id);
              return dinnerDate >= today && participant?.participating === true;
            }).slice().sort((a, b) => new Date(a.dinner_date) - new Date(b.dinner_date));
            
            return upcomingDinners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无待参与的聚餐</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDinners.map(vote => {
                  const dinnerDate = new Date(vote.dinner_date);
                  const today = new Date();
                  const daysRemaining = Math.ceil((dinnerDate - today) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <a
                      key={vote.id}
                      href={`/votes/${vote.id}`}
                      className="block p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 hover:shadow-md transition-all cursor-pointer border border-orange-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{vote.title}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {dinnerDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            daysRemaining === 0 ? 'bg-red-100 text-red-600' :
                            daysRemaining === 1 ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {daysRemaining === 0 ? '今天' : daysRemaining === 1 ? '明天' : `${daysRemaining}天后`}
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">我的投票状态</h2>
          
          {activeVotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无进行中的投票</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userParticipation.map(vote => {
                const viewedVotes = JSON.parse(localStorage.getItem('viewedVotes') || '[]');
                const hasNotViewed = vote.status === 'active' && !viewedVotes.includes(vote.id);
                
                const handleViewDetail = (voteId) => {
                  const viewedVotes = JSON.parse(localStorage.getItem('viewedVotes') || '[]');
                  if (!viewedVotes.includes(voteId)) {
                    viewedVotes.push(voteId);
                    localStorage.setItem('viewedVotes', JSON.stringify(viewedVotes));
                  }
                };

                return (
                  <a
                    key={vote.id}
                    href={`/votes/${vote.id}`}
                    onClick={() => handleViewDetail(vote.id)}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between relative">
                      {hasNotViewed && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{vote.title}</p>
                        <p className="text-sm text-gray-500">{vote.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {vote.participated ? (
                          <span className={`flex items-center space-x-1 text-sm ${
                            vote.voted ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {vote.voted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            <span>{vote.voted ? '已投票' : '已确认参与'}</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-gray-400 text-sm">
                            <XCircle className="w-4 h-4" />
                            <span>未参与投票</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
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
            {['super_admin', 'dept_admin', 'organizer'].includes(currentUser.role) && (
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
            {currentUser.role === 'super_admin' && (
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

      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ThumbsUp className="w-5 h-5 text-green-500 mr-2" />
            我的推荐
          </h2>
          
          {(() => {
            const userRecs = getUserRecommendations(currentUser.id);
            
            if (userRecs.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <ThumbsUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无餐厅推荐记录</p>
                  <a href="/restaurants" className="inline-block mt-2 text-green-500 hover:text-green-600 text-sm">
                    去推荐餐厅
                  </a>
                </div>
              );
            }

            const viewedRecs = JSON.parse(localStorage.getItem('viewedRecommendations') || '[]');

            const getStatusConfig = (status) => {
              switch (status) {
                case 'pending':
                  return {
                    label: '待审核',
                    className: 'bg-yellow-100 text-yellow-600',
                    icon: Clock
                  };
                case 'approved':
                  return {
                    label: '审核通过',
                    className: 'bg-green-100 text-green-600',
                    icon: CheckCircle
                  };
                case 'rejected':
                  return {
                    label: '审核驳回',
                    className: 'bg-red-100 text-red-600',
                    icon: XCircle
                  };
                default:
                  return {
                    label: status,
                    className: 'bg-gray-100 text-gray-600',
                    icon: AlertCircle
                  };
              }
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {userRecs.map(rec => {
                  const statusConfig = getStatusConfig(rec.status);
                  const StatusIcon = statusConfig.icon;
                  const hasNotification = (rec.status !== 'pending') && !viewedRecs.includes(rec.id);

                  return (
                    <button
                      key={rec.id}
                      onClick={() => openRecDetail(rec)}
                      className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all text-left border border-gray-200"
                    >
                      <div className="relative">
                        {hasNotification && (
                          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        )}
                        
                        <h3 className="font-medium text-gray-800 truncate mb-2">{rec.name}</h3>
                        
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusConfig.label}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}
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

      {showRecDetailModal && selectedRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">推荐详情</h2>
              <button
                onClick={closeRecDetail}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">餐厅名称</p>
                <p className="text-gray-800 text-lg font-semibold">{selectedRec.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedRec.cuisine_type && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">菜系类型</p>
                    <p className="text-sm text-gray-800">{selectedRec.cuisine_type}</p>
                  </div>
                )}
                {selectedRec.avg_price > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">人均价格</p>
                    <p className="text-sm text-gray-800">¥{selectedRec.avg_price}/人</p>
                  </div>
                )}
                {selectedRec.address && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">地址</p>
                    <p className="text-sm text-gray-800">{selectedRec.address}</p>
                  </div>
                )}
                {selectedRec.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">电话</p>
                    <p className="text-sm text-gray-800">{selectedRec.phone}</p>
                  </div>
                )}
                {selectedRec.business_hours && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">营业时间</p>
                    <p className="text-sm text-gray-800">{selectedRec.business_hours}</p>
                  </div>
                )}
                {selectedRec.has_private_room !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">是否有包间</p>
                    <p className="text-sm text-gray-800">{selectedRec.has_private_room ? '是' : '否'}</p>
                  </div>
                )}
              </div>

              {selectedRec.tags && selectedRec.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">标签</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRec.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRec.reason && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">推荐理由</p>
                  <p className="text-sm text-green-700">{selectedRec.reason}</p>
                </div>
              )}

              {selectedRec.status === 'rejected' && selectedRec.reject_reason && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-red-600 font-medium mb-1">拒绝原因</p>
                  <p className="text-sm text-red-700">{selectedRec.reject_reason}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">审核状态</span>
                  <span className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedRec.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    selectedRec.status === 'approved' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {selectedRec.status === 'pending' && <Clock className="w-4 h-4" />}
                    {selectedRec.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                    {selectedRec.status === 'rejected' && <XCircle className="w-4 h-4" />}
                    <span>{selectedRec.status === 'pending' ? '待审核' : selectedRec.status === 'approved' ? '审核通过' : '审核驳回'}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  推荐时间: {new Date(selectedRec.recommended_at).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={closeRecDetail}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Home;

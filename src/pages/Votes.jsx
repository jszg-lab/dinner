import { useState } from 'react';
import { Plus, Clock, Users, CheckCircle, XCircle, Trash2, Eye, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Votes = () => {
  const { currentUser, getDepartmentVotes, getDepartmentById, deleteVote, updateVote } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  const departmentVotes = getDepartmentVotes(currentUser.department_id);
  const department = getDepartmentById(currentUser.department_id);

  const filteredVotes = departmentVotes.filter(vote => {
    if (statusFilter === 'all') return true;
    return vote.status === statusFilter;
  });

  const handleEndVote = (voteId) => {
    if (window.confirm('确定要结束这个投票吗？')) {
      updateVote(voteId, { status: 'completed' });
    }
  };

  const handleArchive = (voteId) => {
    if (window.confirm('确定要归档这个投票吗？')) {
      updateVote(voteId, { status: 'archived' });
    }
  };

  const handleDelete = (voteId) => {
    if (window.confirm('确定要删除这个投票吗？')) {
      deleteVote(voteId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">投票管理</h1>
          <p className="text-gray-500 mt-1">查看和管理部门的投票</p>
        </div>
        <div className="flex items-center space-x-3">
          {(currentUser.role === 'admin' || currentUser.role === 'organizer') && (
            <a
              href="/votes/create"
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>发起投票</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        {[
          { value: 'all', label: '全部' },
          { value: 'active', label: '进行中' },
          { value: 'completed', label: '已结束' },
          { value: 'archived', label: '已归档' }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {filteredVotes.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">暂无投票记录</p>
            {(currentUser.role === 'admin' || currentUser.role === 'organizer') && (
              <a
                href="/votes/create"
                className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                发起第一个投票
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVotes.map(vote => {
              const participantsCount = vote.participants?.filter(p => p.participating !== false).length || 0;
              const votedCount = vote.participants?.filter(p => p.restaurant_id).length || 0;

              return (
                <div key={vote.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800">{vote.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            vote.status === 'active' ? 'bg-green-100 text-green-600' :
                            vote.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {vote.status === 'active' ? '进行中' :
                             vote.status === 'completed' ? '已结束' : '已归档'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">{vote.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(vote.created_at)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{votedCount}/{participantsCount} 人已投票</span>
                          </span>
                          {vote.total_amount && (
                            <span className="text-orange-600 font-medium">
                              总金额: ¥{vote.total_amount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/votes/${vote.id}`}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                        {vote.status === 'active' && (
                          <button
                            onClick={() => handleEndVote(vote.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="结束投票"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {vote.status === 'completed' && (
                          <button
                            onClick={() => handleArchive(vote.id)}
                            className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                            title="归档投票"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        {(currentUser.role === 'admin' || currentUser.role === 'organizer') && (
                          <button
                            onClick={() => handleDelete(vote.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除投票"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {vote.restaurant_options && vote.restaurant_options.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">投票选项:</p>
                        <div className="flex flex-wrap gap-2">
                          {vote.restaurant_options.map(restaurantId => {
                            const restaurant = vote.restaurants?.find(r => r.id === restaurantId);
                            return (
                              <span
                                key={restaurantId}
                                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                              >
                                {restaurant?.name || restaurantId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Votes;

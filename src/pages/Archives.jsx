import { useState } from 'react';
import { Download, Clock, Users, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Archives = () => {
  const { currentUser, getDepartmentVotes, getRestaurantById } = useApp();
  const [filterYear, setFilterYear] = useState('all');

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  const departmentVotes = getDepartmentVotes(currentUser.department_id);
  const archivedVotes = departmentVotes.filter(v => v.status === 'archived');

  const years = [...new Set(archivedVotes.map(v => new Date(v.created_at).getFullYear()))];
  years.unshift('all');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRestaurantName = (id) => {
    const restaurant = getRestaurantById(id);
    return restaurant?.name || '未知餐厅';
  };

  const filteredVotes = filterYear === 'all' 
    ? archivedVotes 
    : archivedVotes.filter(v => new Date(v.created_at).getFullYear() === Number(filterYear));

  const handleExport = (vote) => {
    const participants = vote.participants?.filter(p => p.participating !== false) || [];
    const nonParticipants = vote.participants?.filter(p => p.participating === false) || [];
    
    let content = `聚餐投票归档\n\n`;
    content += `投票标题: ${vote.title}\n`;
    content += `描述: ${vote.description || '-'}\n`;
    content += `创建时间: ${new Date(vote.created_at).toLocaleString('zh-CN')}\n`;
    content += `状态: 已归档\n\n`;
    
    content += `餐厅列表及投票结果:\n`;
    Object.entries(vote.results || {}).forEach(([restaurantId, count]) => {
      content += `  ${getRestaurantName(restaurantId)}: ${count} 票\n`;
    });
    content += '\n';
    
    content += `参与人员(${participants.length}人):\n`;
    participants.forEach(p => {
      content += `  ${p.user_nickname} ${p.restaurant_id ? `(投票: ${getRestaurantName(p.restaurant_id)})` : '(未投票)'}\n`;
    });
    content += '\n';
    
    content += `不参与人员(${nonParticipants.length}人):\n`;
    nonParticipants.forEach(p => {
      content += `  ${p.user_nickname}\n`;
    });
    content += '\n';
    
    if (vote.total_amount) {
      content += `结算金额:\n`;
      content += `  总金额: ¥${vote.total_amount}\n`;
      content += `  报销额度: ¥${vote.reimbursement_amount || 0}\n`;
      content += `  每人应付: ¥${vote.per_person_amount || 0}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `聚餐投票_${vote.title}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">归档记录</h1>
          <p className="text-gray-500 mt-1">查看已归档的投票记录</p>
        </div>
        {years.length > 1 && (
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year === 'all' ? '全部年份' : `${year}年`}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {filteredVotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">暂无归档记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVotes.map(vote => {
              const participantsCount = vote.participants?.filter(p => p.participating !== false).length || 0;
              
              return (
                <div key={vote.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{vote.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{vote.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(vote.created_at)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{participantsCount} 人参与</span>
                        </span>
                        {vote.total_amount && (
                          <span className="text-orange-600 font-medium">
                            总金额: ¥{vote.total_amount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleExport(vote)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>导出</span>
                    </button>
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
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Archives;

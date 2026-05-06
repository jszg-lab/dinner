import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Upload, Download, TrendingUp, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const VoteDetail = () => {
  const { 
    currentUser, 
    getVoteById, 
    getRestaurantById, 
    castVote, 
    confirmParticipation,
    updateVote,
    getDepartmentUsers
  } = useApp();
  const [voteId, setVoteId] = useState(null);
  const [vote, setVote] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [receiptCode, setReceiptCode] = useState('');
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [reimbursementAmount, setReimbursementAmount] = useState('');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    setVoteId(id);
  }, []);

  useEffect(() => {
    if (voteId) {
      const foundVote = getVoteById(voteId);
      setVote(foundVote);
      if (foundVote) {
        const participant = foundVote.participants?.find(p => p.user_id === currentUser?.id);
        setSelectedRestaurant(participant?.restaurant_id || null);
      }
    }
  }, [voteId, currentUser?.id, getVoteById]);

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  if (!vote) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">投票不存在</p>
          <a href="/votes" className="inline-block mt-4 text-orange-500 hover:underline">
            返回投票列表
          </a>
        </div>
      </Layout>
    );
  }

  const participant = vote.participants?.find(p => p.user_id === currentUser.id);
  const participating = participant?.participating !== false;
  const hasVoted = !!participant?.restaurant_id;

  const getRestaurantName = (id) => {
    const restaurant = getRestaurantById(id);
    return restaurant?.name || '未知餐厅';
  };

  const handleParticipate = () => {
    confirmParticipation(vote.id, true);
    window.location.reload();
  };

  const handleNotParticipate = () => {
    confirmParticipation(vote.id, false);
    window.location.reload();
  };

  const handleVote = (restaurantId) => {
    if (!participating) {
      alert('请先确认参与聚餐');
      return;
    }
    setSelectedRestaurant(restaurantId);
    castVote(vote.id, restaurantId);
  };

  const handleUploadReceipt = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setReceiptCode(base64);
        updateVote(vote.id, { receipt_code: base64 });
        setShowReceiptUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettlement = () => {
    if (!totalAmount) return;
    const amount = Number(totalAmount);
    const participants = vote.participants?.filter(p => p.participating !== false) || [];
    const perPerson = participants.length > 0 ? (amount / participants.length).toFixed(2) : '0';
    
    updateVote(vote.id, {
      total_amount: amount,
      reimbursement_amount: Number(reimbursementAmount) || 0,
      per_person_amount: Number(perPerson),
      status: 'completed'
    });
    setShowSettlement(false);
    window.location.reload();
  };

  const handleExport = () => {
    const participants = vote.participants?.filter(p => p.participating !== false) || [];
    const nonParticipants = vote.participants?.filter(p => p.participating === false) || [];
    
    let content = `聚餐投票归档\n\n`;
    content += `投票标题: ${vote.title}\n`;
    content += `描述: ${vote.description || '-'}\n`;
    content += `创建时间: ${new Date(vote.created_at).toLocaleString('zh-CN')}\n`;
    content += `状态: ${vote.status === 'active' ? '进行中' : vote.status === 'completed' ? '已结束' : '已归档'}\n\n`;
    
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

  const participantsList = vote.participants?.filter(p => p.participating !== false) || [];
  const nonParticipantsList = vote.participants?.filter(p => p.participating === false) || [];

  const sortedResults = Object.entries(vote.results || {}).sort((a, b) => b[1] - a[1]);
  const maxVotes = sortedResults.length > 0 ? sortedResults[0][1] : 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <a href="/votes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{vote.title}</h1>
            <p className="text-gray-500">{vote.description}</p>
          </div>
        </div>

        {vote.status === 'active' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">我的参与状态</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                participating 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {participating ? '已参与' : '不参与'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              可随时修改参与状态
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={handleParticipate}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  participating
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                <Check className="w-5 h-5" />
                <span className="font-medium">参与聚餐</span>
              </button>
              <button
                onClick={handleNotParticipate}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  !participating
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                <X className="w-5 h-5" />
                <span className="font-medium">不参与</span>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">餐厅列表</h3>
            {vote.status === 'active' && (
              <span className={`text-sm ${
                participating 
                  ? 'text-green-600' 
                  : 'text-gray-500'
              }`}>
                {participating ? '点击餐厅进行投票' : '参与后可投票'}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vote.restaurant_options?.map(restaurantId => {
              const restaurant = getRestaurantById(restaurantId);
              const votes = vote.results?.[restaurantId] || 0;
              const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
              
              const isSelected = selectedRestaurant === restaurantId;
              const canVote = vote.status === 'active' && participating;
              
              return (
                <div
                  key={restaurantId}
                  onClick={() => canVote && handleVote(restaurantId)}
                  className={`relative p-4 border rounded-lg transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : canVote
                        ? 'border-gray-200 hover:border-orange-300 cursor-pointer'
                        : 'border-gray-200 cursor-default opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{restaurant?.name}</p>
                      <p className="text-sm text-gray-500">{restaurant?.cuisine_type} · ¥{restaurant?.avg_price}/人</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>得票数: {votes}</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {vote.status === 'active' && participating && !hasVoted && (
            <p className="mt-4 text-center text-gray-500">点击选择您想去的餐厅</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
            实时投票结果
          </h3>
          
          {sortedResults.length === 0 ? (
            <p className="text-center text-gray-500 py-8">暂无投票数据</p>
          ) : (
            <div className="space-y-4">
              {sortedResults.map(([restaurantId, votes]) => {
                const restaurant = getRestaurantById(restaurantId);
                const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
                
                return (
                  <div key={restaurantId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">{restaurant?.name || restaurantId}</span>
                      <span className="text-gray-500">{votes} 票 ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">参与人员</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">参与 ({participantsList.length}人)</p>
              <div className="flex flex-wrap gap-2">
                {participantsList.map(p => (
                  <span
                    key={p.user_id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      p.restaurant_id ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {p.user_nickname}
                    {p.restaurant_id && ` ✓`}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">不参与 ({nonParticipantsList.length}人)</p>
              <div className="flex flex-wrap gap-2">
                {nonParticipantsList.map(p => (
                  <span
                    key={p.user_id}
                    className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm"
                  >
                    {p.user_nickname}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(vote.status === 'completed' || vote.status === 'archived') && vote.total_amount && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-green-800 mb-4">结算信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">总金额</p>
                <p className="text-2xl font-bold text-green-600">¥{vote.total_amount}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">每人应付</p>
                <p className="text-2xl font-bold text-green-600">¥{vote.per_person_amount || 0}</p>
              </div>
              {vote.reimbursement_amount > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">报销额度</p>
                  <p className="text-xl font-bold text-blue-600">¥{vote.reimbursement_amount}</p>
                </div>
              )}
            </div>

            {vote.receipt_code && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">收款码</p>
                <img
                  src={vote.receipt_code}
                  alt="收款码"
                  className="max-w-xs rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        )}

        {(currentUser.role === 'admin' || currentUser.role === 'organizer') && vote.status === 'active' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">组织者操作</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setShowSettlement(true)}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>设置结算金额</span>
              </button>
            </div>
          </div>
        )}

        {(currentUser.role === 'admin' || currentUser.role === 'organizer') && vote.status === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">组织者操作</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {!vote.receipt_code && (
                <button
                  onClick={() => setShowReceiptUpload(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>上传收款码</span>
                </button>
              )}
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>导出归档</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showReceiptUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">上传收款码</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadReceipt}
              className="w-full border border-gray-300 rounded-lg p-4"
            />
            <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG 格式，大小不超过 5MB</p>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowReceiptUpload(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">设置结算金额</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">总金额 (元) *</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="请输入总金额"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">报销额度 (元)</label>
                <input
                  type="number"
                  value={reimbursementAmount}
                  onChange={(e) => setReimbursementAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="请输入报销额度"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">参与人数</p>
                <p className="text-xl font-bold text-gray-800">{participantsList.length} 人</p>
              </div>

              {totalAmount && participantsList.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">每人应付</p>
                  <p className="text-xl font-bold text-green-600">¥{(Number(totalAmount) / participantsList.length).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSettlement(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSettlement}
                disabled={!totalAmount}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认结算
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VoteDetail;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle, AlertCircle, XCircle, Archive, Download, Shuffle, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { voteService } from '../../services/voteService.js';
import { restaurantService } from '../../services/restaurantService.js';
import { settlementService } from '../../services/settlementService.js';
import { userService } from '../../services/userService.js';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import { formatDateTime, formatCurrency, formatRelativeTime } from '../../utils/formatters.js';

export default function VoteDetail() {
  const { id } = useParams();
  const { user, canCreateVote } = useAuth();
  const navigate = useNavigate();
  
  const [vote, setVote] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [results, setResults] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isParticipating, setIsParticipating] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVoteRecord, setUserVoteRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settlement, setSettlement] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawResult, setDrawResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, refreshKey]);

  const loadData = () => {
    setLoading(true);
    const voteData = voteService.getVoteById(id);
    setVote(voteData);

    if (voteData) {
      const restaurantData = voteData.restaurantIds.map(rid => 
        restaurantService.getRestaurantById(rid)
      ).filter(Boolean);
      setRestaurants(restaurantData);

      const resultsData = voteService.getVoteResults(id);
      setResults(resultsData);

      if (user) {
        const voted = voteService.hasUserVoted(id, user.id);
        setHasVoted(voted);
        
        if (voted) {
          const record = voteService.getUserVoteRecord(id, user.id);
          setUserVoteRecord(record);
          if (record) {
            setIsParticipating(record.isParticipating);
            if (record.selectedRestaurantIds && record.selectedRestaurantIds.length > 0) {
              setSelectedRestaurant(record.selectedRestaurantIds[0]);
            }
          }
        }
      }

      const settlementData = settlementService.getSettlement(id);
      setSettlement(settlementData);
      
      const drawResultData = voteService.getDrawResult(id);
      setDrawResult(drawResultData);
    }

    setLoading(false);

    if (voteData?.status === 'active') {
      const timer = setTimeout(() => setRefreshKey(prev => prev + 1), 5000);
      return () => clearTimeout(timer);
    }
  };

  const handleDraw = () => {
    if (!window.confirm('确定要进行抽签吗？这将从平票的餐厅中随机选择一家。')) {
      return;
    }
    
    setIsDrawing(true);
    try {
      const result = voteService.drawRestaurant(id);
      setDrawResult(result);
      setMessage({ type: 'success', text: '抽签成功！' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsDrawing(false);
    }
  };

  const getWinners = () => {
    if (!results) return [];
    return voteService.getWinners(id);
  };

  const isTie = () => {
    return voteService.isTie(id);
  };

  const selectRestaurant = (rid) => {
    if (vote?.status !== 'active' || !isParticipating) return;
    setSelectedRestaurant(prev => prev === rid ? null : rid);
  };

  const handleSubmitVote = async () => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      voteService.submitVote(id, {
        isParticipating,
        selectedRestaurantIds: isParticipating && selectedRestaurant ? [selectedRestaurant] : [],
      }, user.id);
      setHasVoted(true);
      setMessage({ type: 'success', text: '投票成功！' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndVote = () => {
    if (window.confirm('确定要结束投票吗？结束后将无法再投票。')) {
      voteService.setVoteStatus(id, 'ended');
      loadData();
    }
  };

  const handleArchive = () => {
    if (window.confirm('确定要归档此投票吗？归档后将生成完整的聚餐记录。')) {
      try {
        voteService.archiveVote(id);
        setMessage({ type: 'success', text: '归档成功！' });
        loadData();
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
    }
  };

  const handleExportArchive = () => {
    const archives = voteService.getAllArchives();
    const archive = archives.find(a => a.voteId === id);
    if (archive) {
      const text = voteService.exportArchiveAsText(archive.id);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `聚餐投票归档_${archive.title}_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  if (!vote) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">投票不存在</h2>
        <Link to="/" className="text-primary hover:underline">返回首页</Link>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: '未开始' },
    active: { color: 'bg-green-100 text-green-700', label: '进行中' },
    ended: { color: 'bg-gray-100 text-gray-700', label: '已结束' },
  };

  const status = statusConfig[vote.status] || statusConfig.pending;
  const isOrganizer = user?.id === vote.organizerId;
  const totalVotes = results ? results.restaurants.reduce((sum, r) => sum + r.voteCount, 0) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{vote.title}</h1>
            {vote.description && (
              <p className="text-text-secondary">{vote.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {vote.archived && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                已归档
              </span>
            )}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm text-text-secondary">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDateTime(vote.startTime)}</span>
          </div>
          <div className="flex items-center text-sm text-text-secondary">
            <Clock className="w-4 h-4 mr-2" />
            <span>{formatRelativeTime(vote.endTime)}</span>
          </div>
          <div className="flex items-center text-sm text-text-secondary">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {results ? `${results.participatingCount}人参与 / ${results.notParticipatingCount}人不参与` : '0人投票'}
            </span>
          </div>
        </div>

        <div className="text-sm text-text-secondary pt-4 border-t border-gray-100">
          组织者：{vote.organizerName || '未知'}
          {vote.departmentId && (
            <span className="ml-4">
              部门：{userService.getDepartmentName(vote.departmentId)}
            </span>
          )}
        </div>

        {message.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </Card>

      {vote.status !== 'active' && (
        <Card className="mb-6">
          <div className="text-center">
            {drawResult ? (
              <div className="animate-pulse">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">获胜餐厅！</h3>
                {(() => {
                  const winner = restaurants.find(r => r.id === drawResult.selectedRestaurantId);
                  return winner && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 inline-block">
                      <p className="text-2xl font-bold text-yellow-800">{winner.name}</p>
                      <p className="text-sm text-yellow-700 mt-2">
                        {winner.cuisineType} • ¥{winner.avgPrice}/人
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">通过抽签决定</p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                {(() => {
                  const winners = getWinners();
                  const isTie = winners.length > 1;
                  const hasVotes = results && results.participatingCount > 0;
                  
                  if (hasVotes && winners.length > 0) {
                    const winner = restaurants.find(r => r.id === winners[0].restaurantId);
                    return (
                      <>
                        {isTie ? (
                          <>
                            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">出现平票！</h3>
                            <p className="text-gray-600 mb-4">
                              以下餐厅票数相同，请组织者进行抽签决定：
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                              {winners.map(w => {
                                const restaurant = restaurants.find(r => r.id === w.restaurantId);
                                return restaurant && (
                                  <span key={w.restaurantId} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
                                    {restaurant.name} ({w.voteCount}票)
                                  </span>
                                );
                              })}
                            </div>
                            {canCreateVote && isOrganizer && (
                              <Button
                                onClick={handleDraw}
                                loading={isDrawing}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                <Shuffle className="w-5 h-5 mr-2" />
                                {isDrawing ? '抽签中...' : '开始抽签'}
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">获胜餐厅！</h3>
                            {winner && (
                              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 inline-block">
                                <p className="text-2xl font-bold text-green-800">{winner.name}</p>
                                <p className="text-sm text-green-700 mt-2">
                                  {winner.cuisineType} • ¥{winner.avgPrice}/人 • {winners[0].voteCount}票
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    );
                  } else {
                    return (
                      <>
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">暂无投票数据</p>
                      </>
                    );
                  }
                })()}
              </>
            )}
          </div>
        </Card>
      )}

      {vote.status === 'active' && !hasVoted && user && (
        <Card title="参与确认" className="mb-6">
          <p className="text-text-secondary mb-4">请先确认您是否参与本次聚餐</p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setIsParticipating(true);
                setSelectedRestaurant(null);
              }}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                isParticipating
                  ? 'border-success bg-success/10'
                  : 'border-gray-200 hover:border-success/50'
              }`}
            >
              <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${isParticipating ? 'text-success' : 'text-gray-400'}`} />
              <p className={`font-medium ${isParticipating ? 'text-success' : 'text-text-secondary'}`}>
                我要参与
              </p>
            </button>
            <button
              onClick={() => {
                setIsParticipating(false);
                setSelectedRestaurant(null);
              }}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                !isParticipating
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className={`w-8 h-8 mx-auto mb-2 ${!isParticipating ? 'text-red-500' : 'text-gray-400'}`} />
              <p className={`font-medium ${!isParticipating ? 'text-red-500' : 'text-text-secondary'}`}>
                我不参与
              </p>
            </button>
          </div>
        </Card>
      )}

      {vote.status === 'active' && hasVoted && user && (
        <Card className="mb-6">
          <div className={`p-4 rounded-lg ${userVoteRecord?.isParticipating ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              {userVoteRecord?.isParticipating ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success mr-2" />
                  <span className="text-success font-medium">您已选择参与本次聚餐</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-500 font-medium">您已选择不参与本次聚餐</span>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card title="投票选项（单选）" className="mb-6">
        <div className="space-y-4">
          {restaurants.map((restaurant, index) => {
            const result = results?.restaurants.find(r => r.restaurantId === restaurant.id) || { voteCount: 0, percentage: 0 };
            const isSelected = selectedRestaurant === restaurant.id;
            const isUserVoted = userVoteRecord?.selectedRestaurantIds?.includes(restaurant.id);

            return (
              <div
                key={restaurant.id}
                onClick={() => vote.status === 'active' && !hasVoted && isParticipating && selectRestaurant(restaurant.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
                  ${isUserVoted ? 'ring-2 ring-success ring-offset-2' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-text-primary">{restaurant.name}</h3>
                      {isUserVoted && (
                        <span className="ml-2 px-2 py-0.5 bg-success/10 text-success text-xs rounded">
                          您的选择
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {restaurant.cuisineType} | ¥{restaurant.avgPrice}/人 | ⭐{restaurant.rating}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{result.voteCount} 票</div>
                    <div className="text-sm text-text-secondary">{result.percentage}%</div>
                  </div>
                </div>

                <ProgressBar
                  value={result.percentage}
                  color={isUserVoted ? 'bg-success' : 'bg-primary'}
                />

                {vote.status === 'active' && !hasVoted && isParticipating && (
                  <div className="mt-3 flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    <span className="ml-2 text-sm text-text-secondary">
                      {isSelected ? '已选择' : '点击选择'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {vote.status === 'active' && !hasVoted && user && (
          <div className="mt-6">
            <Button
              onClick={handleSubmitVote}
              loading={submitting}
              disabled={isParticipating && !selectedRestaurant}
              className="w-full"
              size="lg"
            >
              {isParticipating ? '提交投票' : '确认不参与'}
            </Button>
            {isParticipating && !selectedRestaurant && (
              <p className="text-center text-sm text-text-secondary mt-2">
                请选择一个餐厅
              </p>
            )}
          </div>
        )}
      </Card>

      {settlement && (
        <Card title="聚餐结算" className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-text-primary">{formatCurrency(settlement.totalAmount)}</div>
              <div className="text-sm text-text-secondary mt-1">聚餐总金额</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-success">{formatCurrency(settlement.reimbursementAmount)}</div>
              <div className="text-sm text-text-secondary mt-1">报销额度</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-text-primary">{settlement.participantCount}</div>
              <div className="text-sm text-text-secondary mt-1">参与人数</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(settlement.perPersonAmount)}</div>
              <div className="text-sm text-text-secondary mt-1">每人应付</div>
            </div>
          </div>

          {settlement.paymentQRCode && (
            <div className="text-center">
              <h4 className="font-medium text-text-primary mb-4">请扫码支付</h4>
              <div className="inline-block p-4 bg-white rounded-lg border border-gray-200">
                <img
                  src={settlement.paymentQRCode}
                  alt="收款码"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <p className="text-sm text-text-secondary mt-4">
                支付 {formatCurrency(settlement.perPersonAmount)} 给组织者
              </p>
            </div>
          )}
        </Card>
      )}

      {canCreateVote && isOrganizer && vote.status === 'ended' && (
        <div className="flex justify-center space-x-4 mb-6">
          {!vote.archived && (
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="w-4 h-4 mr-2" />
              归档投票
            </Button>
          )}
          {vote.archived && (
            <Button variant="outline" onClick={handleExportArchive}>
              <Download className="w-4 h-4 mr-2" />
              导出归档
            </Button>
          )}
          {!settlement && (
            <Button onClick={() => navigate(`/votes/${id}/settlement`)}>
              管理结算
            </Button>
          )}
        </div>
      )}

      {canCreateVote && isOrganizer && vote.status === 'active' && !settlement && (
        <div className="flex justify-center space-x-4 mb-6">
          <Button variant="outline" onClick={handleEndVote}>
            结束投票
          </Button>
          <Button onClick={() => navigate(`/votes/${id}/settlement`)}>
            管理结算
          </Button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Vote, Calendar, Users, Building2, Archive, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { voteService } from '../services/voteService.js';
import { userService } from '../services/userService.js';
import VoteCard from '../components/vote/VoteCard.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function HomePage() {
  const { user, canCreateVote, userDepartmentId, userDepartmentName } = useAuth();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadVotes();
  }, [userDepartmentId]);

  const loadVotes = () => {
    setLoading(true);
    const data = voteService.getAllVotes(userDepartmentId);
    setVotes(data);
    setLoading(false);
  };

  const filteredVotes = votes.filter(vote => {
    if (filter === 'all') return true;
    if (filter === 'active') return vote.status === 'active';
    if (filter === 'ended') return vote.status === 'ended';
    if (filter === 'mine') return vote.organizerId === user?.id;
    if (filter === 'archived') return vote.archived;
    return true;
  });

  const activeCount = votes.filter(v => v.status === 'active').length;
  const totalCount = votes.length;

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              聚餐投票
              {userDepartmentName && (
                <span className="text-lg font-normal text-text-secondary ml-2">
                  - {userDepartmentName}
                </span>
              )}
            </h1>
            <p className="text-text-secondary">
              一起选择餐厅，轻松组织团队聚餐
            </p>
          </div>
          {canCreateVote && (
            <Link to="/votes/create">
              <Button size="lg">
                <PlusCircle className="w-5 h-5 mr-2" />
                发起投票
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card hover={false}>
            <div className="flex items-center">
              <div className="p-3 bg-primary/10 rounded-lg mr-4">
                <Vote className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{totalCount}</div>
                <div className="text-sm text-text-secondary">全部投票</div>
              </div>
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-center">
              <div className="p-3 bg-success/10 rounded-lg mr-4">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{activeCount}</div>
                <div className="text-sm text-text-secondary">进行中</div>
              </div>
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-center">
              <div className="p-3 bg-secondary/10 rounded-lg mr-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {votes.reduce((sum, v) => sum + voteService.getParticipantCount(v.id), 0)}
                </div>
                <div className="text-sm text-text-secondary">总参与人次</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <Link to="/help" className="flex items-center gap-4 p-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">使用手册</h3>
              <p className="text-sm text-gray-600">快速了解如何使用聚餐投票系统</p>
            </div>
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </Card>

        {!user && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-center">
              <Link to="/login" className="font-medium hover:underline">登录</Link>
              后可以参与投票
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            进行中
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'ended'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            已结束
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'archived'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            已归档
          </button>
          {user && (
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'mine'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              我组织的
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">
          加载中...
        </div>
      ) : filteredVotes.length === 0 ? (
        <div className="text-center py-12">
          <Vote className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-4">暂无投票</p>
          {canCreateVote && (
            <Link to="/votes/create">
              <Button>发起第一个投票</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVotes.map((vote, index) => (
            <div
              key={vote.id}
              className={`animate-fade-in animate-stagger-${Math.min(index + 1, 5)}`}
              style={{ opacity: 0 }}
            >
              <VoteCard
                vote={vote}
                participantCount={voteService.getParticipantCount(vote.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

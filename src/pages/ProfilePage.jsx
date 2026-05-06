import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Vote, History, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { voteService } from '../services/voteService.js';
import { userService } from '../services/userService.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { getRoleName, getRoleColor, formatDateTime } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const [voteRecords, setVoteRecords] = useState([]);
  const [organizedVotes, setOrganizedVotes] = useState([]);

  useEffect(() => {
    if (user) {
      const records = voteService.getUserVoteRecords(user.id);
      setVoteRecords(records);

      const votes = voteService.getAllVotes().filter(v => v.organizerId === user.id);
      setOrganizedVotes(votes);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">请先登录</p>
        <Link to="/login" className="text-primary hover:underline">前往登录</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mr-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {user.nickname}
            </h1>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {getRoleName(user.role)}
              </span>
              <span className="text-sm text-text-secondary">
                @{user.username}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card hover={false}>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {voteRecords.length}
            </div>
            <div className="text-sm text-text-secondary">参与投票</div>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">
              {organizedVotes.length}
            </div>
            <div className="text-sm text-text-secondary">组织投票</div>
          </div>
        </Card>
        <Card hover={false}>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">
              {voteRecords.filter(r => {
                const vote = voteService.getVoteById(r.voteId);
                return vote?.hasSettlement;
              }).length}
            </div>
            <div className="text-sm text-text-secondary">已结算</div>
          </div>
        </Card>
      </div>

      {organizedVotes.length > 0 && (
        <Card title="我组织的投票" className="mb-6">
          <div className="space-y-4">
            {organizedVotes.map(vote => (
              <Link
                key={vote.id}
                to={`/votes/${vote.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-text-primary">{vote.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {formatDateTime(vote.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vote.status === 'active' ? 'bg-green-100 text-green-700' :
                    vote.status === 'ended' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {vote.status === 'active' ? '进行中' : vote.status === 'ended' ? '已结束' : '未开始'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {voteRecords.length > 0 && (
        <Card title="我的投票记录">
          <div className="space-y-4">
            {voteRecords.map(record => {
              const vote = voteService.getVoteById(record.voteId);
              if (!vote) return null;
              
              return (
                <Link
                  key={record.id}
                  to={`/votes/${record.voteId}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-text-primary">{vote.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">
                        投票时间：{formatDateTime(record.votedAt)}
                      </p>
                    </div>
                    <span className="text-primary text-sm">查看详情 →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {voteRecords.length === 0 && organizedVotes.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <History className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary mb-4">暂无投票记录</p>
            <Link to="/">
              <Button>参与投票</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function VoteCard({ vote, participantCount }) {
  const { user } = useAuth();

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: '未开始' },
    active: { color: 'bg-green-100 text-green-700', label: '进行中' },
    ended: { color: 'bg-gray-100 text-gray-700', label: '已结束' },
  };

  const status = statusConfig[vote.status] || statusConfig.pending;

  return (
    <Link to={`/votes/${vote.id}`}>
      <div className="card hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {vote.title}
            </h3>
            {vote.description && (
              <p className="text-text-secondary text-sm line-clamp-2">
                {vote.description}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-3 mb-4">
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
            <span>{participantCount || 0} 人已投票</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-text-secondary">
            组织者：{vote.organizerName || '未知'}
          </div>
          <div className="flex items-center text-primary text-sm font-medium">
            {vote.hasSettlement && (
              <span className="flex items-center mr-3">
                <CheckCircle className="w-4 h-4 mr-1" />
                已结算
              </span>
            )}
            <span>查看详情 →</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
            {vote.restaurantIds?.length || 0} 个选项
          </span>
        </div>
      </div>
    </Link>
  );
}

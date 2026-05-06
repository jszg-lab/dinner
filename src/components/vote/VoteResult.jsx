import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FDCB6E', '#00B894', '#6C5CE7', '#A29BFE'];

export default function VoteResult({ results, restaurants }) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        暂无投票数据
      </div>
    );
  }

  const data = results.map(r => {
    const restaurant = restaurants.find(res => res.id === r.restaurantId);
    return {
      name: restaurant?.name || '未知',
      votes: r.voteCount,
      percentage: parseFloat(r.percentage),
    };
  }).sort((a, b) => b.votes - a.votes);

  const totalVotes = data.reduce((sum, d) => sum + d.votes, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-text-primary">{data.name}</p>
          <p className="text-sm text-text-secondary mt-1">
            {data.votes} 票 ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#636E72' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#636E72' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-2">
        {data.map((d, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-text-primary">{d.name}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-text-primary">{d.votes} 票</span>
              <span className="text-text-secondary ml-2">({d.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-text-secondary">
        共 {totalVotes} 人参与投票
      </div>
    </div>
  );
}

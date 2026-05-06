import { useState } from 'react';
import { ArrowLeft, Plus, X, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const CreateVote = () => {
  const { currentUser, restaurants, createVote, getDepartmentById } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [duration, setDuration] = useState(30);

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  if (currentUser.role !== 'admin' && currentUser.role !== 'organizer') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">您没有权限发起投票</p>
          <a href="/votes" className="inline-block mt-4 text-orange-500 hover:underline">
            返回投票列表
          </a>
        </div>
      </Layout>
    );
  }

  const toggleRestaurant = (restaurantId) => {
    if (selectedRestaurants.includes(restaurantId)) {
      setSelectedRestaurants(selectedRestaurants.filter(id => id !== restaurantId));
    } else {
      if (selectedRestaurants.length < 6) {
        setSelectedRestaurants([...selectedRestaurants, restaurantId]);
      } else {
        alert('最多选择6个餐厅');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入投票标题');
      return;
    }
    if (selectedRestaurants.length < 2) {
      alert('请至少选择2个餐厅');
      return;
    }

    const voteData = {
      title: title.trim(),
      description: description.trim(),
      restaurant_options: selectedRestaurants,
      restaurants: restaurants.filter(r => selectedRestaurants.includes(r.id)),
      department_id: currentUser.department_id,
      duration_minutes: duration,
      created_by: currentUser.id,
      created_by_nickname: currentUser.nickname
    };

    createVote(voteData);
    window.location.href = '/votes';
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <a href="/votes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">发起投票</h1>
            <p className="text-gray-500">创建新的聚餐投票</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">投票标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="例如：周五部门聚餐投票"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">投票描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="添加一些描述信息..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              <span>投票时长</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value={15}>15 分钟</option>
              <option value={30}>30 分钟</option>
              <option value={60}>1 小时</option>
              <option value={120}>2 小时</option>
              <option value={1440}>1 天</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择餐厅 * (最多6个)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {restaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  onClick={() => toggleRestaurant(restaurant.id)}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRestaurants.includes(restaurant.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{restaurant.name}</p>
                    <p className="text-sm text-gray-500">{restaurant.cuisine_type} · ¥{restaurant.avg_price}/人</p>
                  </div>
                  {selectedRestaurants.includes(restaurant.id) && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              已选择 {selectedRestaurants.length}/6 个餐厅
            </p>
          </div>

          <div className="flex space-x-3">
            <a
              href="/votes"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </a>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              发起投票
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateVote;

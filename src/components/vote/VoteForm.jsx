import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { voteService } from '../../services/voteService.js';
import { restaurantService } from '../../services/restaurantService.js';
import { userService } from '../../services/userService.js';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Card from '../common/Card.jsx';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function VoteForm({ onSuccess }) {
  const { user, userDepartmentId, userDepartmentName } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    restaurantIds: [],
    startTime: '',
    endTime: '',
    departmentId: userDepartmentId || null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const data = restaurantService.getAllRestaurants();
    setRestaurants(data);
  }, []);

  const totalPages = Math.ceil(restaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = restaurants.slice(startIndex, endIndex);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleRestaurant = (id) => {
    setFormData(prev => ({
      ...prev,
      restaurantIds: prev.restaurantIds.includes(id)
        ? prev.restaurantIds.filter(rId => rId !== id)
        : [...prev.restaurantIds, id],
    }));
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const now = new Date();
      const startTime = formData.startTime ? new Date(formData.startTime) : now;
      const endTime = formData.endTime ? new Date(formData.endTime) : new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (endTime <= startTime) {
        setErrors({ endTime: '结束时间必须晚于开始时间' });
        setLoading(false);
        return;
      }

      voteService.createVote({
        title: formData.title,
        description: formData.description,
        restaurantIds: formData.restaurantIds,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        organizerId: user.id,
        organizerName: user.nickname,
        departmentId: formData.departmentId,
      });

      onSuccess && onSuccess();
      navigate('/');
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getDefaultEndTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card title="投票信息" className="mb-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <Input
          label="投票标题"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="例如：本周五团队聚餐投票"
          error={errors.title}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            投票描述（可选）
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="添加投票的详细说明..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {userDepartmentName && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-700">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="text-sm">部门：{userDepartmentName}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="开始时间"
            type="datetime-local"
            name="startTime"
            value={formData.startTime || getDefaultStartTime()}
            onChange={handleChange}
            required
          />
          <Input
            label="结束时间"
            type="datetime-local"
            name="endTime"
            value={formData.endTime || getDefaultEndTime()}
            onChange={handleChange}
            error={errors.endTime}
            required
          />
        </div>
      </Card>

      <Card title={`选择餐厅（已选 ${formData.restaurantIds.length} 个）`}>
        <div className="mb-4 text-sm text-text-secondary">
          共 {restaurants.length} 家餐厅，当前第 {currentPage} / {totalPages || 1} 页
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            暂无餐厅数据，请先导入餐厅
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentRestaurants.map(restaurant => {
                const isSelected = formData.restaurantIds.includes(restaurant.id);
                return (
                  <div
                    key={restaurant.id}
                    onClick={() => toggleRestaurant(restaurant.id)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-primary truncate">{restaurant.name}</h4>
                        <p className="text-sm text-text-secondary mt-1">{restaurant.cuisineType}</p>
                        <div className="flex items-center mt-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{restaurant.rating}</span>
                          <span className="mx-2 text-text-secondary">|</span>
                          <span>¥{restaurant.avgPrice}/人</span>
                        </div>
                      </div>
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2
                        ${isSelected ? 'bg-primary text-white' : 'border-2 border-gray-300'}
                      `}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {formData.restaurantIds.length < 2 && (
          <p className="mt-4 text-sm text-text-secondary">
            提示：至少需要选择 2 个餐厅进行投票
          </p>
        )}
      </Card>

      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="outline" onClick={() => navigate('/')}>
          取消
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={formData.restaurantIds.length < 2}
        >
          发布投票
        </Button>
      </div>
    </form>
  );
}

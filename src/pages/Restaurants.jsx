import { useState } from 'react';
import { Search, Plus, Star, MapPin, Phone, Clock, X, Edit2, Trash2, Upload, Check, ThumbsUp, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const Restaurants = () => {
  const { 
    restaurants, 
    addRestaurant, 
    updateRestaurant, 
    deleteRestaurant, 
    currentUser,
    addRestaurantRecommendation,
    approveRecommendation,
    rejectRecommendation,
    getPendingRecommendations,
    getUserRecommendations
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('restaurants');

  const [formData, setFormData] = useState({
    name: '',
    cuisine_type: '',
    avg_price: '',
    rating: '',
    address: '',
    phone: '',
    business_hours: '',
    has_private_room: false,
    tags: ''
  });

  const [recommendData, setRecommendData] = useState({
    name: '',
    cuisine_type: '',
    avg_price: '',
    address: '',
    phone: '',
    business_hours: '',
    has_private_room: false,
    tags: '',
    reason: ''
  });

  const [rejectReason, setRejectReason] = useState('');
  const [reviewRecommendation, setReviewRecommendation] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [recommendError, setRecommendError] = useState('');

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  const cuisineTypes = ['川菜', '粤菜', '北京菜', '湘菜', '日料', '西北菜', '江浙菜', '云南菜', '其他'];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || restaurant.cuisine_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const data = {
      ...formData,
      avg_price: Number(formData.avg_price) || 0,
      rating: Number(formData.rating) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    if (editingRestaurant) {
      updateRestaurant(editingRestaurant.id, data);
    } else {
      addRestaurant(data);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cuisine_type: '',
      avg_price: '',
      rating: '',
      address: '',
      phone: '',
      business_hours: '',
      has_private_room: false,
      tags: ''
    });
    setEditingRestaurant(null);
  };

  const openEditModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      cuisine_type: restaurant.cuisine_type,
      avg_price: restaurant.avg_price.toString(),
      rating: restaurant.rating.toString(),
      address: restaurant.address,
      phone: restaurant.phone,
      business_hours: restaurant.business_hours,
      has_private_room: restaurant.has_private_room,
      tags: restaurant.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleDelete = (restaurantId) => {
    if (window.confirm('确定要删除这家餐厅吗？')) {
      deleteRestaurant(restaurantId);
    }
  };

  const handleRecommendSubmit = async (e) => {
    e.preventDefault();
    setRecommendError('');

    if (!recommendData.name.trim()) {
      setRecommendError('请输入餐厅名称');
      return;
    }

    const data = {
      ...recommendData,
      avg_price: Number(recommendData.avg_price) || 0,
      tags: recommendData.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    const result = await addRestaurantRecommendation(data);
    if (result.success) {
      alert('推荐成功，等待管理员审核');
      setShowRecommendModal(false);
      resetRecommendForm();
    } else {
      setRecommendError(result.message);
    }
  };

  const resetRecommendForm = () => {
    setRecommendData({
      name: '',
      cuisine_type: '',
      avg_price: '',
      address: '',
      phone: '',
      business_hours: '',
      has_private_room: false,
      tags: '',
      reason: ''
    });
    setRecommendError('');
  };

  const handleApprove = () => {
    approveRecommendation(reviewRecommendation.id);
    alert('审核通过，餐厅已添加到餐厅池');
    setShowReviewModal(false);
    setReviewRecommendation(null);
    setReviewAction(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }
    rejectRecommendation(reviewRecommendation.id, rejectReason);
    alert('已拒绝该推荐，拒绝原因已发送给推荐用户');
    setShowReviewModal(false);
    setRejectReason('');
    setReviewRecommendation(null);
    setReviewAction(null);
  };

  const openReviewModal = (rec, action) => {
    setReviewRecommendation(rec);
    setReviewAction(action);
    setRejectReason('');
    setShowReviewModal(true);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.restaurants && Array.isArray(data.restaurants)) {
            data.restaurants.forEach(restaurant => {
              addRestaurant(restaurant);
            });
            alert('导入成功！');
          } else {
            alert('JSON格式不正确');
          }
        } catch {
          alert('JSON解析失败');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">餐厅管理</h1>
          <p className="text-gray-500 mt-1">管理餐厅数据，支持增删查改</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRecommendModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>推荐餐厅</span>
          </button>
          {currentUser.role === 'super_admin' && (
            <>
              <label className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">导入JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加餐厅</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'restaurants'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          餐厅列表
        </button>
        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === 'recommendations'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            餐厅推荐审核
            {getPendingRecommendations().length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {getPendingRecommendations().length}
              </span>
            )}
          </button>
        )}
      </div>

      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索餐厅名称或菜系..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">全部菜系</option>
            {cuisineTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRestaurants.map(restaurant => (
            <div key={restaurant.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">{restaurant.name}</h3>
                  {currentUser.role === 'super_admin' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditModal(restaurant)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                    {restaurant.cuisine_type}
                  </span>
                  {restaurant.has_private_room && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      包间
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-600">{restaurant.rating}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600">¥{restaurant.avg_price}/人</span>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.business_hours}</span>
                  </div>
                </div>

                {restaurant.tags && restaurant.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {restaurant.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到匹配的餐厅</p>
          </div>
        )}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingRestaurant ? '编辑餐厅' : '添加餐厅'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">餐厅名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入餐厅名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">菜系</label>
                <select
                  value={formData.cuisine_type}
                  onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">请选择菜系</option>
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">人均价格</label>
                  <input
                    type="number"
                    value={formData.avg_price}
                    onChange={(e) => setFormData({ ...formData, avg_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入地址"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入电话"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">营业时间</label>
                  <input
                    type="text"
                    value={formData.business_hours}
                    onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="如: 11:00-22:00"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_private_room}
                    onChange={(e) => setFormData({ ...formData, has_private_room: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">有包间</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="多个标签用逗号分隔"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingRestaurant ? '保存修改' : '添加餐厅'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">待审核餐厅推荐</h2>
          
          {getPendingRecommendations().length === 0 ? (
            <div className="text-center py-12">
              <ThumbsUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">暂无待审核的餐厅推荐</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getPendingRecommendations().map(rec => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{rec.name}</h3>
                      <p className="text-sm text-gray-500">推荐人: {rec.recommended_by_nickname}</p>
                      <p className="text-sm text-gray-500">推荐时间: {new Date(rec.recommended_at).toLocaleString('zh-CN')}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">待审核</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">菜系</p>
                      <p className="text-gray-800">{rec.cuisine_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">人均价格</p>
                      <p className="text-gray-800">¥{rec.avg_price}/人</p>
                    </div>
                    <div>
                      <p className="text-gray-500">地址</p>
                      <p className="text-gray-800">{rec.address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">电话</p>
                      <p className="text-gray-800">{rec.phone || '-'}</p>
                    </div>
                  </div>

                  {rec.reason && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600">
                        <FileText className="w-4 h-4 inline mr-1" />
                        推荐理由: {rec.reason}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openReviewModal(rec, 'approve')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>审核通过</span>
                    </button>
                    <button
                      onClick={() => openReviewModal(rec, 'reject')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>拒绝</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showRecommendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">推荐餐厅</h2>
              <button
                onClick={() => { setShowRecommendModal(false); resetRecommendForm(); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {recommendError && (
              <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {recommendError}
              </div>
            )}

            <form onSubmit={handleRecommendSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">餐厅名称 *</label>
                <input
                  type="text"
                  value={recommendData.name}
                  onChange={(e) => setRecommendData({ ...recommendData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入餐厅名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">菜系</label>
                <select
                  value={recommendData.cuisine_type}
                  onChange={(e) => setRecommendData({ ...recommendData, cuisine_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">请选择菜系</option>
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">人均价格</label>
                <input
                  type="number"
                  value={recommendData.avg_price}
                  onChange={(e) => setRecommendData({ ...recommendData, avg_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  type="text"
                  value={recommendData.address}
                  onChange={(e) => setRecommendData({ ...recommendData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入地址"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                <input
                  type="tel"
                  value={recommendData.phone}
                  onChange={(e) => setRecommendData({ ...recommendData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">营业时间</label>
                <input
                  type="text"
                  value={recommendData.business_hours}
                  onChange={(e) => setRecommendData({ ...recommendData, business_hours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="如: 11:00-22:00"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recommendData.has_private_room}
                    onChange={(e) => setRecommendData({ ...recommendData, has_private_room: e.target.checked })}
                    className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">有包间</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <input
                  type="text"
                  value={recommendData.tags}
                  onChange={(e) => setRecommendData({ ...recommendData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="多个标签用逗号分隔"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">推荐理由</label>
                <textarea
                  value={recommendData.reason}
                  onChange={(e) => setRecommendData({ ...recommendData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="请说明推荐这家餐厅的理由..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowRecommendModal(false); resetRecommendForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  提交推荐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewModal && reviewRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {reviewAction === 'approve' ? '确认通过餐厅推荐' : '确认拒绝餐厅推荐'}
              </h2>
              <button
                onClick={() => { setShowReviewModal(false); setRejectReason(''); setReviewRecommendation(null); setReviewAction(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">餐厅名称</p>
                <p className="text-gray-800">{reviewRecommendation.name}</p>
              </div>

              {reviewAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">拒绝原因 <span className="text-red-500">*</span></label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="请说明拒绝该推荐的原因，此原因将发送给推荐用户..."
                  />
                </div>
              )}

              {reviewAction === 'approve' && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    确认通过后，该餐厅将被添加到餐厅池中，推荐用户也会收到通知。
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => { setShowReviewModal(false); setRejectReason(''); setReviewRecommendation(null); setReviewAction(null); }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>取消</span>
                </button>
                <button
                  onClick={reviewAction === 'approve' ? handleApprove : handleReject}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${
                    reviewAction === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>确认</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Restaurants;

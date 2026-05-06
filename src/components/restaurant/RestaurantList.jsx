import React, { useState, useEffect } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService.js';
import RestaurantCard from './RestaurantCard.jsx';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import JsonImportModal from './JsonImportModal.jsx';
import Input from '../common/Input.jsx';

const ITEMS_PER_PAGE = 8;

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = () => {
    setLoading(true);
    const data = restaurantService.getAllRestaurants();
    setRestaurants(data);
    setLoading(false);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    const results = restaurantService.searchRestaurants(searchKeyword);
    setRestaurants(results);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这家餐厅吗？')) {
      restaurantService.deleteRestaurant(id);
      loadRestaurants();
    }
  };

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowEditModal(true);
  };

  const handleSaveEdit = (data) => {
    restaurantService.updateRestaurant(selectedRestaurant.id, data);
    setShowEditModal(false);
    setSelectedRestaurant(null);
    loadRestaurants();
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    loadRestaurants();
  };

  const totalPages = Math.ceil(restaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = restaurants.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="搜索餐厅名称、菜系..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch}>
            搜索
          </Button>
          <Button variant="outline" onClick={() => {
            setSearchKeyword('');
            loadRestaurants();
          }}>
            重置
          </Button>
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            导入JSON
          </Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-text-secondary">
        共 {restaurants.length} 家餐厅，当前第 {currentPage} / {totalPages || 1} 页
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">
          加载中...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">暂无餐厅数据</p>
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            导入餐厅数据
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className={`animate-fade-in animate-stagger-${Math.min(index + 1, 5)}`}
                style={{ opacity: 0 }}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <Button
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

      <JsonImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      {showEditModal && selectedRestaurant && (
        <RestaurantEditModal
          restaurant={selectedRestaurant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRestaurant(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function RestaurantEditModal({ restaurant, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    cuisineType: restaurant.cuisineType,
    avgPrice: restaurant.avgPrice,
    rating: restaurant.rating,
    address: restaurant.address,
    phone: restaurant.phone,
    businessHours: restaurant.businessHours,
    suitableGroupSize: restaurant.suitableGroupSize,
    hasPrivateRoom: restaurant.hasPrivateRoom,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal visible={true} title="编辑餐厅" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="餐厅名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="菜系"
            value={formData.cuisineType}
            onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
          />
          <Input
            label="人均价格"
            type="number"
            value={formData.avgPrice}
            onChange={(e) => setFormData({ ...formData, avgPrice: Number(e.target.value) })}
          />
          <Input
            label="评分"
            type="number"
            step="0.1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
          />
          <div className="md:col-span-2">
            <Input
              label="地址"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <Input
            label="电话"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="营业时间"
            value={formData.businessHours}
            onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
          />
          <Input
            label="适合人数"
            value={formData.suitableGroupSize}
            onChange={(e) => setFormData({ ...formData, suitableGroupSize: e.target.value })}
          />
          <div className="flex items-center pt-8">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasPrivateRoom}
                onChange={(e) => setFormData({ ...formData, hasPrivateRoom: e.target.checked })}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-text-primary">提供包间</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">
            保存修改
          </Button>
        </div>
      </form>
    </Modal>
  );
}

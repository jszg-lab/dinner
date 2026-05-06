import React from 'react';
import { Star, MapPin, Phone, Clock, Users, ThumbsUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export default function RestaurantCard({ restaurant, showActions, onEdit, onDelete }) {
  return (
    <div className="card hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {restaurant.name}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
              {restaurant.cuisineType}
            </span>
            {restaurant.hasPrivateRoom && (
              <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">
                有包间
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <span className="ml-1 font-medium text-text-primary">
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="ml-1 text-text-secondary text-sm">
            ({restaurant.reviewCount}条评价)
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start text-sm text-text-secondary">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{restaurant.address}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{restaurant.phone || '暂无电话'}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{restaurant.businessHours || '暂无营业时间'}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary">
          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>适合 {restaurant.suitableGroupSize || '未知'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(restaurant.avgPrice)}
          </span>
          <span className="text-text-secondary text-sm ml-1">人均</span>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(restaurant)}
                className="px-3 py-1 text-sm text-secondary hover:bg-secondary/10 rounded transition-colors"
              >
                编辑
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(restaurant.id)}
                className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                删除
              </button>
            )}
          </div>
        )}
      </div>

      {restaurant.tags && restaurant.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {restaurant.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-text-secondary text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

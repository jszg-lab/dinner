import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { restaurantService } from '../services/restaurantService.js';
import RestaurantList from '../components/restaurant/RestaurantList.jsx';
import Button from '../components/common/Button.jsx';

export default function RestaurantListPage() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">请先登录</p>
        <Link to="/login" className="text-primary hover:underline">前往登录</Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">您没有权限访问此页面</p>
        <Link to="/" className="text-primary hover:underline">返回首页</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">餐厅管理</h1>
        <p className="text-text-secondary">
          管理系统中的餐厅数据，支持导入和编辑
        </p>
      </div>

      <RestaurantList />
    </div>
  );
}

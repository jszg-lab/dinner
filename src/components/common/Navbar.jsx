import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, User, LogOut, PlusCircle, Utensils, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isAdmin, canCreateVote, canManageRestaurants } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-text-primary">聚餐投票</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Home className="w-5 h-5" />
              <span>首页</span>
            </Link>

            <Link
              to="/help"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>使用手册</span>
            </Link>

            {canCreateVote && (
              <Link
                to="/votes/create"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                <span>发起投票</span>
              </Link>
            )}

            {canManageRestaurants && (
              <Link
                to="/restaurants"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Utensils className="w-5 h-5" />
                <span>餐厅管理</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/users"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Users className="w-5 h-5" />
                <span>用户管理</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>{user.nickname}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <Link to="/login" className="btn-outline text-sm">
                  登录
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

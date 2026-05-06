import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(formData.nickname, formData.password);
      navigate('/');
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">欢迎回来</h1>
          <p className="text-text-secondary mt-2">登录您的聚餐投票账号</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="relative mb-4">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                name="nickname"
                placeholder="昵称（至少2个字）"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="relative mb-6">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="password"
                name="password"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              登录
            </Button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-secondary text-center mb-2">测试账号：</p>
              <p className="text-xs text-text-secondary text-center">
                昵称：管理员 | 密码：admin123
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

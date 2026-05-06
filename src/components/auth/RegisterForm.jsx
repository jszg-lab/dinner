import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.nickname.trim().length < 2) {
      setErrors({ nickname: '昵称至少需要2个字符' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: '两次密码输入不一致' });
      return;
    }

    setLoading(true);

    try {
      await register(formData.nickname, formData.password, formData.nickname);
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">创建账号</h1>
          <p className="text-text-secondary mt-2">加入聚餐投票，开始使用</p>
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
              <Input
                type="text"
                name="nickname"
                placeholder="昵称（至少2个字，作为登录账号）"
                value={formData.nickname}
                onChange={handleChange}
                className="pl-12"
                error={errors.nickname}
                required
              />
            </div>

            <div className="relative mb-4">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <Input
                type="password"
                name="password"
                placeholder="密码（至少6个字符）"
                value={formData.password}
                onChange={handleChange}
                className="pl-12"
                required
              />
            </div>

            <div className="relative mb-6">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="确认密码"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-12"
                error={errors.confirmPassword}
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              注册
            </Button>

            <p className="text-center mt-6 text-text-secondary">
              已有账号？{' '}
              <Link to="/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

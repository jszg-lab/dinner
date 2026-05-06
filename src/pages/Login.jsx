import { useState } from 'react';
import { Utensils, User, Lock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Login = () => {
  const { login, currentUser } = useApp();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentUser) {
    window.location.href = '/home';
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim() || !password.trim()) {
      setError('请输入昵称和密码');
      return;
    }

    const result = login(nickname.trim(), password);
    if (result.success) {
      window.location.href = '/home';
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">聚餐投票系统</h1>
          <p className="text-gray-500 mt-2">高效选择餐厅，轻松组织聚餐</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center space-x-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="请输入昵称"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            登录
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            测试账号：<span className="font-medium text-gray-700">管理员</span> / <span className="font-medium text-gray-700">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

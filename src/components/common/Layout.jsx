import { useState } from 'react';
import { Menu, X, User, Home, Users, Utensils, BarChart3, Archive, Book } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Layout = ({ children }) => {
  const { currentUser, logout, getDepartmentById } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const department = currentUser ? getDepartmentById(currentUser.department_id) : null;

  const navItems = [
    { icon: Home, path: '/', label: '首页' },
    { icon: Utensils, path: '/restaurants', label: '餐厅管理' },
    { icon: BarChart3, path: '/votes', label: '投票管理' },
    { icon: Archive, path: '/archives', label: '归档记录' },
    { icon: Book, path: '/manual', label: '使用手册' },
  ];

  const adminNavItems = [
    { icon: Users, path: '/users', label: '用户管理' },
    { icon: Users, path: '/departments', label: '部门管理' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-2">
                <Utensils className="w-8 h-8 text-orange-500" />
                <span className="text-xl font-bold text-gray-800">聚餐投票</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <div className="hidden md:block text-sm text-gray-600">
                    <span className="font-medium">{currentUser.nickname}</span>
                    <span className="mx-2">|</span>
                    <span>{department?.name || '-'}</span>
                    <span className="mx-2">|</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {currentUser.role === 'admin' ? '管理员' : currentUser.role === 'organizer' ? '组织者' : '成员'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline">退出</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full pt-16 pb-4 overflow-y-auto">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{currentUser?.nickname}</p>
                <p className="text-sm text-gray-500">{department?.name}</p>
              </div>
            </div>
          </div>

          <nav className="px-2 mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              );
            })}

            {currentUser?.role === 'admin' && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 mt-4">管理中心</div>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </>
            )}
          </nav>
        </div>
      </aside>

      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

import React from 'react';
import { BookOpen, ChevronRight, ChevronDown, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card.jsx';

export default function HelpPage() {
  const [expandedSections, setExpandedSections] = React.useState({
    quickStart: true,
    permissions: false,
    features: false,
    faq: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionToggle = ({ id, title, icon: Icon }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-2"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {expandedSections[id] ? (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-4"
        >
          <Home className="w-4 h-4 mr-2" />
          返回首页
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">使用手册</h1>
        </div>
        <p className="text-gray-600">
          欢迎使用聚餐投票系统！本手册将帮助您快速上手。
        </p>
      </div>

      <Card className="p-6">
        <SectionToggle id="quickStart" title="快速入门" icon={BookOpen} />
        {expandedSections.quickStart && (
          <div className="p-4 mb-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">首次登录</h3>
            <p className="text-blue-700 mb-2">系统默认提供管理员账号：</p>
            <ul className="list-disc list-inside text-blue-600 mb-4">
              <li><strong>昵称</strong>：管理员</li>
              <li><strong>密码</strong>：admin123</li>
            </ul>

            <h3 className="font-semibold text-blue-800 mb-3">创建部门</h3>
            <ol className="list-decimal list-inside text-blue-600 mb-4 space-y-1">
              <li>登录管理员账号</li>
              <li>进入用户管理页面</li>
              <li>点击「管理部门」按钮</li>
              <li>添加新部门（如：技术部、市场部等）</li>
            </ol>

            <h3 className="font-semibold text-blue-800 mb-3">添加用户</h3>
            <ol className="list-decimal list-inside text-blue-600 mb-4 space-y-1">
              <li>在用户管理页面</li>
              <li>点击「添加用户」或「批量添加用户」</li>
              <li>填写用户昵称并选择部门</li>
              <li>点击「保存」</li>
            </ol>

            <h3 className="font-semibold text-blue-800 mb-3">开始投票</h3>
            <ol className="list-decimal list-inside text-blue-600 space-y-1">
              <li>点击「发起投票」</li>
              <li>填写投票标题和描述</li>
              <li>设置投票起止时间</li>
              <li>选择参与投票的餐厅</li>
              <li>发布投票</li>
            </ol>
          </div>
        )}

        <SectionToggle id="permissions" title="权限说明" icon={BookOpen} />
        {expandedSections.permissions && (
          <div className="p-4 mb-4 bg-purple-50 rounded-lg">
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">超级管理员</h3>
                <ul className="list-disc list-inside text-purple-600 space-y-1">
                  <li>可以管理所有部门和用户</li>
                  <li>可以发起和管理所有部门的投票</li>
                  <li>可以管理所有餐厅</li>
                  <li>拥有全部系统权限</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">组织者</h3>
                <ul className="list-disc list-inside text-purple-600 space-y-1">
                  <li>可以发起和管理本部门的投票</li>
                  <li>可以查看本部门的投票结果</li>
                  <li>可以结束投票和进行抽签</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">普通成员</h3>
                <ul className="list-disc list-inside text-purple-600 space-y-1">
                  <li>可以参与本部门的投票</li>
                  <li>可以查看实时投票结果</li>
                  <li>可以查看历史投票和归档</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <SectionToggle id="features" title="功能指南" icon={BookOpen} />
        {expandedSections.features && (
          <div className="p-4 mb-4 bg-green-50 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-green-800 mb-3">餐厅管理</h3>
              <div className="text-green-700 space-y-2">
                <h4 className="font-medium">添加餐厅</h4>
                <ol className="list-decimal list-inside ml-4 space-y-1 text-green-600">
                  <li>进入「餐厅管理」页面</li>
                  <li>点击「添加餐厅」</li>
                  <li>填写餐厅信息：名称、菜系类型、平均消费、评分</li>
                  <li>点击「保存」</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-green-800 mb-3">投票功能</h3>
              <div className="text-green-700 space-y-2">
                <h4 className="font-medium">参与投票</h4>
                <ol className="list-decimal list-inside ml-4 space-y-1 text-green-600">
                  <li>在首页找到要参与的投票</li>
                  <li>进入投票详情页</li>
                  <li>选择「我要参与」或「我不参与」</li>
                  <li>如选择参与，从餐厅列表中选择一家</li>
                  <li>点击「提交投票」</li>
                </ol>
                <div className="mt-2 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <p className="text-yellow-800 text-sm">
                    <strong>投票规则：</strong>每个用户只能投票一次，投票采用单选方式，投票后无法修改。
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-green-800 mb-3">平票抽签</h3>
              <p className="text-green-700">当投票结束后，如果出现多餐厅平票的情况，组织者可以进行抽签：</p>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-green-600">
                <li>查看「出现平票！」提示</li>
                <li>确认平票的餐厅及其票数</li>
                <li>点击「开始抽签」按钮</li>
                <li>系统随机选择一家餐厅作为获胜者</li>
              </ol>
            </div>
          </div>
        )}

        <SectionToggle id="faq" title="常见问题" icon={BookOpen} />
        {expandedSections.faq && (
          <div className="p-4 mb-4 bg-orange-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-orange-800">
                  Q: 登录时提示「账号或密码错误」？
                </h3>
                <p className="text-orange-700 ml-4 mt-2">
                  A: 请确保使用正确的昵称和密码，默认管理员账号是「管理员」，密码是「admin123」。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">
                  Q: 抽签可以重复进行吗？
                </h3>
                <p className="text-orange-700 ml-4 mt-2">
                  A: 不可以，抽签结果一旦确定就不可更改，确保结果的公正性。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">
                  Q: 部门之间的数据是互通的吗？
                </h3>
                <p className="text-orange-700 ml-4 mt-2">
                  A: 不是，不同部门的数据完全隔离，确保隐私和数据安全。
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>最后更新时间：2025年</p>
      </div>
    </div>
  );
}

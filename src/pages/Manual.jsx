import { useState } from 'react';
import { Book, ChevronDown, ChevronUp, Anchor, Home, Users, Utensils, Vote, Settings, HelpCircle } from 'lucide-react';
import Layout from '../components/common/Layout';
import { useApp } from '../context/AppContext';

const manualData = {
  title: '聚餐投票系统使用手册',
  sections: [
    {
      id: 'quick-start',
      title: '快速入门',
      icon: Home,
      subsections: [
        {
          id: 'first-login',
          title: '首次登录',
          content: `系统默认提供管理员账号：
- **昵称**：管理员
- **密码**：admin123`
        },
        {
          id: 'create-department',
          title: '创建部门',
          content: `1. 登录管理员账号
2. 进入用户管理页面
3. 点击「管理部门」按钮
4. 添加新部门（如：技术部、市场部等）`
        },
        {
          id: 'add-user',
          title: '添加用户',
          content: `1. 在用户管理页面
2. 点击「添加用户」或「批量添加用户」
3. 填写用户昵称并选择部门
4. 点击「保存」`
        },
        {
          id: 'start-vote',
          title: '开始投票',
          content: `1. 点击「发起投票」
2. 填写投票标题和描述
3. 设置投票起止时间
4. 选择参与投票的餐厅
5. 发布投票`
        }
      ]
    },
    {
      id: 'permissions',
      title: '权限说明',
      icon: Users,
      subsections: [
        {
          id: 'admin',
          title: '超级管理员',
          content: `- 可以管理所有部门和用户
- 可以发起和管理所有部门的投票
- 可以管理所有餐厅
- 拥有全部系统权限`
        },
        {
          id: 'organizer',
          title: '组织者',
          content: `- 可以发起和管理本部门的投票
- 可以查看本部门的投票结果
- 可以结束投票和进行抽签`
        },
        {
          id: 'member',
          title: '普通成员',
          content: `- 可以参与本部门的投票
- 可以查看实时投票结果
- 可以查看历史投票和归档
- 可以推荐餐厅（需管理员审核）
- 可以修改个人密码`
        }
      ]
    },
    {
      id: 'features',
      title: '功能指南',
      icon: Settings,
      subsections: [
        {
          id: 'restaurant-management',
          title: '餐厅管理',
          content: '',
          subsubsections: [
            {
              id: 'add-restaurant',
              title: '添加餐厅',
              content: `1. 进入「餐厅管理」页面
2. 点击「添加餐厅」
3. 填写餐厅信息：
   - 餐厅名称
   - 菜系类型
   - 平均消费
   - 评分（1-5分）
4. 点击「保存」`
            },
            {
              id: 'import-json',
              title: 'JSON 导入',
              content: `1. 在餐厅管理页面点击「导入 JSON」
2. 按格式准备餐厅数据
3. 粘贴或上传 JSON 内容
4. 点击「导入」

示例 JSON 格式：
\`\`\`json
[
  {
    "name": "川味馆",
    "cuisineType": "川菜",
    "avgPrice": 80,
    "rating": 4.5
  }
]
\`\`\``
            },
            {
              id: 'restaurant-search',
              title: '餐厅搜索',
              content: `- 支持按餐厅名称搜索
- 支持按菜系筛选
- 支持分页浏览`
            },
            {
              id: 'recommend-restaurant',
              title: '推荐餐厅',
              content: `所有用户均可推荐餐厅：
1. 进入「餐厅管理」页面
2. 点击「推荐餐厅」按钮
3. 填写餐厅信息和推荐理由
4. 提交后等待管理员审核

系统会自动检测重复：
- 如果餐厅已存在，会提示修改或取消
- 如果已有待审核推荐，会提示等待审核`
            }
          ]
        },
        {
          id: 'vote-features',
          title: '投票功能',
          content: '',
          subsubsections: [
            {
              id: 'create-vote',
              title: '发起投票',
              content: `1. 点击「发起投票」
2. 填写投票信息：
   - 投票标题
   - 详细描述（可选）
   - 投票时长
3. 选择参与投票的餐厅（至少 2 家）
4. 发布投票`
            },
            {
              id: 'participate-vote',
              title: '参与投票',
              content: `1. 在首页找到要参与的投票
2. 进入投票详情页
3. 选择「我要参与」或「我不参与」
4. 如选择参与，从餐厅列表中选择一家
5. 点击餐厅即可完成投票`
            },
            {
              id: 'vote-rules',
              title: '投票规则',
              content: `- 每个用户只能投票一次
- 投票采用单选方式，每人只能选择一家餐厅
- 投票后可以重新选择（修改投票）
- 可随时查看实时投票结果`
            }
          ]
        },
        {
          id: 'vote-management',
          title: '投票管理',
          content: '',
          subsubsections: [
            {
              id: 'end-vote',
              title: '结束投票',
              content: `- 组织者可以随时结束投票
- 结束后用户无法再投票
- 投票结果立即确定`
            },
            {
              id: 'archive-vote',
              title: '归档投票',
              content: `1. 投票结束后可进行归档
2. 归档包含完整的投票信息和结果
3. 支持导出归档记录为文本文件
4. 归档后可在「已归档」标签页查看`
            },
            {
              id: 'settlement',
              title: '结算管理',
              content: `1. 投票结束后可以添加结算信息
2. 填写总金额和报销金额
3. 系统自动计算每人应付金额
4. 可添加付款二维码（可选）`
            }
          ]
        },
        {
          id: 'user-department',
          title: '用户与部门管理',
          content: '',
          subsubsections: [
            {
              id: 'department-management',
              title: '部门管理',
              content: `- 超级管理员可以添加、编辑、删除部门
- 部门之间数据完全隔离
- 不同部门的用户看不到其他部门的投票和餐厅`
            },
            {
              id: 'user-management',
              title: '用户管理',
              content: `- 添加单个用户：填写昵称，选择部门
- 批量添加用户：一次性添加多个用户到同一部门
- 用户昵称至少 2 个字符
- 用户登录后只能看到本部门的内容
- 用户可以在首页修改自己的密码`
            }
          ]
        }
      ]
    },
    {
      id: 'faq',
      title: '常见问题',
      icon: HelpCircle,
      subsections: [
        {
          id: 'login-error',
          title: '登录时提示「账号或密码错误」？',
          content: `请检查：
- 确保使用正确的昵称（不是用户名）
- 确保密码输入正确
- 默认管理员账号：昵称「管理员」，密码「admin123」`
        },
        {
          id: 'change-password',
          title: '如何修改用户密码？',
          content: `用户可以在首页点击「修改密码」按钮自行修改：
1. 输入当前密码进行身份验证
2. 输入新密码（至少6位）
3. 确认新密码后提交`
        },
        {
          id: 'multiple-votes',
          title: '可以同时发起多个投票吗？',
          content: `可以，同一部门可以同时发起多个投票。`
        },
        {
          id: 'view-results',
          title: '投票结束后还可以查看结果吗？',
          content: `可以，所有投票记录都会保留，您可以随时查看历史投票结果。`
        },
        {
          id: 'export-restaurants',
          title: '餐厅数据可以导出吗？',
          content: `目前餐厅数据暂不支持导出，但可以通过 JSON 格式导入数据。`
        },
        {
          id: 'department-isolation',
          title: '部门之间的投票和餐厅数据是互通的吗？',
          content: `不是，不同部门的数据完全隔离，确保隐私和数据安全。`
        }
      ]
    }
  ]
};

const Manual = () => {
  const { currentUser } = useApp();
  const [expandedSections, setExpandedSections] = useState(['quick-start']);
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [expandedSubsubsections, setExpandedSubsubsections] = useState({});

  if (!currentUser) {
    window.location.href = '/';
    return null;
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleSubsection = (subsectionId) => {
    setExpandedSubsections(prev => ({
      ...prev,
      [subsectionId]: !prev[subsectionId]
    }));
  };

  const toggleSubsubsection = (subsubsectionId) => {
    setExpandedSubsubsections(prev => ({
      ...prev,
      [subsubsectionId]: !prev[subsubsectionId]
    }));
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setExpandedSections(prev => [...new Set([...prev, sectionId.split('-')[0]])]);
  };

  const renderContent = (content) => {
    if (!content) return null;
    
    return content.split('\n').map((line, index) => {
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 text-gray-600 mb-1 flex items-start">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            <span>{line.slice(2)}</span>
          </li>
        );
      } else if (line.startsWith('```')) {
        const isEnd = index > 0 && content.split('\n')[index - 1]?.startsWith('```');
        if (isEnd) return null;
        const codeBlock = content.split('```')[1];
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-2">
            <code>{codeBlock}</code>
          </pre>
        );
      } else if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-gray-600 mb-2">
            {parts.map((part, i) => 
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={i} className="text-gray-800">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      } else {
        return <p key={index} className="text-gray-600 mb-2">{line}</p>;
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-6">
          <aside className="w-64 flex-shrink-0 sticky top-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Book className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-800">目录</h2>
              </div>
              <nav className="space-y-1">
                {manualData.sections.map(section => (
                  <div key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <section.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{section.title}</span>
                    </button>
                    {expandedSections.includes(section.id) && section.subsections.map(subsection => (
                      <button
                        key={subsection.id}
                        onClick={() => scrollToSection(subsection.id)}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 pl-10 rounded-lg hover:bg-gray-50 text-left transition-colors"
                      >
                        <span className="text-sm text-gray-600">{subsection.title}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 mb-6 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <Book className="w-8 h-8" />
                <h1 className="text-2xl font-bold">{manualData.title}</h1>
              </div>
              <p className="text-orange-100">欢迎使用聚餐投票系统，本手册将帮助您快速上手</p>
            </div>

            {manualData.sections.map(section => (
              <section key={section.id} id={section.id} className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedSections.includes(section.id) && section.subsections.map(subsection => (
                  <div key={subsection.id} id={subsection.id} className="mb-6 last:mb-0">
                    <button
                      onClick={() => toggleSubsection(subsection.id)}
                      className="w-full flex items-center justify-between text-left mb-3"
                    >
                      <div className="flex items-center space-x-2">
                        <Anchor className="w-4 h-4 text-gray-400" />
                        <h3 className="font-semibold text-gray-800">{subsection.title}</h3>
                      </div>
                      {subsection.subsubsections ? (
                        expandedSubsections[subsection.id] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )
                      ) : null}
                    </button>

                    {subsection.subsubsections ? (
                      <>
                        {expandedSubsections[subsection.id] !== false && subsection.subsubsections.map(subsub => (
                          <div key={subsub.id} id={subsub.id} className="ml-6 mb-4 last:mb-0">
                            <button
                              onClick={() => toggleSubsubsection(subsub.id)}
                              className="w-full flex items-center justify-between text-left mb-2"
                            >
                              <h4 className="font-medium text-gray-700">{subsub.title}</h4>
                              {expandedSubsubsections[subsub.id] ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            {expandedSubsubsections[subsub.id] !== false && (
                              <div className="bg-gray-50 rounded-lg p-4 ml-4">
                                {renderContent(subsub.content)}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 ml-6">
                        {renderContent(subsection.content)}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            ))}

            <footer className="bg-gray-50 rounded-xl p-6 mt-6 text-center text-gray-500 text-sm">
              <p>聚餐投票系统使用手册</p>
              <p className="mt-1">最后更新时间：2026年5月</p>
            </footer>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Manual;
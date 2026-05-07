import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Anchor, Home, Users, Utensils, Vote, Settings, HelpCircle, Clock, BarChart3, AlertCircle, Star, Book } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Layout from '../components/common/Layout';

const manualData = {
  title: '聚餐投票系统使用手册',
  testAccounts: {
    title: '测试账号',
    content: `系统默认提供以下测试账号，可用于体验不同权限：

**超级管理员**（拥有全部权限）：
- **昵称**：管理员
- **密码**：admin123

**部门管理员**（管理各自部门）：
- **研发部**：昵称「研发部」，密码「123456」
- **产品部**：昵称「产品部」，密码「123456」
- **市场部**：昵称「市场部」，密码「123456」
- **运营部**：昵称「运营部」，密码「123456」

**组织者**（可发起投票）：
- **研发部**：昵称「张三」，密码「123456」
- **产品部**：昵称「钱七」，密码「123456」
- **市场部**：昵称「周九」，密码「123456」

**普通成员**（可参与投票）：
- **研发部**：昵称「李四」、「王五」，密码「123456」
- **产品部**：昵称「赵六」，密码「123456」
- **市场部**：昵称「孙八」，密码「123456」
- **运营部**：昵称「吴十」，密码「123456」`
  },
  sections: [
    {
      id: 'overview',
      title: '系统概述',
      icon: Home,
      subsections: [
        {
          id: 'system-intro',
          title: '系统简介',
          content: `聚餐投票系统是一款专为企业/团队设计的聚餐组织工具，旨在通过民主投票方式快速决定聚餐地点。系统支持部门隔离、实时投票、平票抽签、费用结算等核心功能。`
        },
        {
          id: 'architecture',
          title: '系统架构',
          content: `- **前端框架**: React + Vite
- **样式方案**: Tailwind CSS 3
- **图标库**: Lucide React
- **后端**: Node.js + Express + SQLite`
        },
        {
          id: 'modules',
          title: '主要功能模块',
          content: `| 模块 | 功能描述 | 访问路径 |
|------|----------|----------|
| 登录模块 | 用户身份验证 | / |
| 首页仪表板 | 数据概览、快速操作 | /home |
| 投票管理 | 创建、参与、查看投票 | /votes |
| 餐厅管理 | 添加、推荐、审核餐厅 | /restaurants |
| 用户管理 | 管理系统用户 | /users |
| 部门管理 | 管理部门（仅超级管理员） | /departments |
| 归档记录 | 查看历史投票归档 | /archives |`
        }
      ]
    },
    {
      id: 'quick-start',
      title: '快速入门',
      icon: Clock,
      subsections: [
        {
          id: 'login-steps',
          title: '登录步骤',
          content: `1. 打开浏览器访问系统首页
2. 在登录页面输入昵称和密码
3. 点击「登录」按钮
4. 登录成功后自动跳转至首页仪表板`
        },
        {
          id: 'create-department',
          title: '创建部门',
          content: `1. 登录管理员账号
2. 进入用户管理页面
3. 点击「管理部门」按钮
4. 添加新部门（如：研发部、产品部、市场部、运营部等）`
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
3. 设置投票时长
4. 选择参与投票的餐厅
5. 发布投票`
        }
      ]
    },
    {
      id: 'features',
      title: '功能模块详解',
      icon: Settings,
      subsections: [
        {
          id: 'dashboard',
          title: '首页仪表板',
          content: '',
          subsubsections: [
            {
              id: 'dashboard-layout',
              title: '页面布局',
              content: `- **顶部导航栏**: 显示当前用户信息、部门名称、退出按钮
- **数据统计卡片**: 餐厅总数、部门人数、进行中投票、已完成投票
- **待参与聚餐**: 显示即将到来的聚餐安排
- **我的投票状态**: 显示当前进行中的投票及个人参与状态
- **快速操作区**: 快捷入口（浏览餐厅、发起投票、历史记录、修改密码）`
            },
            {
              id: 'dashboard-actions',
              title: '操作说明',
              content: `- 点击统计卡片可快速跳转到对应模块
- 点击待参与聚餐卡片可进入投票详情页
- 点击我的投票状态卡片可查看投票详情并进行投票
- 点击快速操作按钮可直接进入对应功能模块`
            },
            {
              id: 'change-password',
              title: '修改密码',
              content: `1. 点击「修改密码」按钮
2. 输入当前密码
3. 输入新密码（至少6位）
4. 确认新密码
5. 点击「确认修改」`
            }
          ]
        },
        {
          id: 'vote-management',
          title: '投票管理',
          content: '',
          subsubsections: [
            {
              id: 'vote-list',
              title: '投票列表',
              content: `- 按状态筛选（全部/进行中/已结束/已归档）
- 显示投票标题、描述、创建时间、参与人数
- 显示个人参与状态标识
- 组织者可进行结束投票、归档、删除操作`
            },
            {
              id: 'create-vote',
              title: '创建投票',
              content: `**权限要求**: 超级管理员、部门管理员、组织者

**操作步骤**:
1. 填写投票标题（必填）
2. 填写投票描述（可选）
3. 设置投票时长（15分钟/30分钟/1小时/2小时/1天）
4. 选择聚餐日期（必填）
5. 选择参与投票的餐厅（至少选择2家，最多10家）
6. 点击「发起投票」按钮

**注意事项**:
- 投票标题不能为空
- 必须选择至少2家餐厅
- 聚餐日期不能早于当天`
            },
            {
              id: 'vote-detail',
              title: '投票详情',
              content: `**参与投票步骤**:
1. 点击「参与聚餐」或「不参与」按钮确认参与状态
2. 若选择参与，点击餐厅列表中的餐厅进行投票
3. 投票后显示「已投票」状态
4. 可随时查看实时投票结果

**平票处理**:
- 当出现多个餐厅票数相同时，系统会显示「平票」提示
- 投票结束后，组织者可进行抽签决定最终结果

**组织者操作**:
- 设置结算金额：输入总金额和报销额度，系统自动计算每人应付
- 上传收款码：支持上传收款二维码图片
- 导出归档：将投票记录导出为文本文件`
            }
          ]
        },
        {
          id: 'restaurant-management',
          title: '餐厅管理',
          content: '',
          subsubsections: [
            {
              id: 'restaurant-list',
              title: '餐厅列表',
              content: `- 搜索餐厅名称或菜系
- 按菜系类型筛选
- 显示餐厅详细信息（名称、菜系、评分、人均、地址、电话、营业时间）
- 支持标签展示`
            },
            {
              id: 'add-restaurant',
              title: '添加餐厅',
              content: `**权限要求**: 超级管理员

**操作步骤**:
1. 点击「添加餐厅」按钮
2. 填写餐厅名称（必填）
3. 选择菜系类型
4. 填写人均价格
5. 设置评分（0-5分）
6. 填写地址、电话、营业时间
7. 勾选是否有包间
8. 添加标签（用逗号分隔）
9. 点击「添加餐厅」按钮`
            },
            {
              id: 'recommend-restaurant',
              title: '推荐餐厅',
              content: `**权限要求**: 所有用户

**操作步骤**:
1. 点击「推荐餐厅」按钮
2. 填写餐厅名称（必填）
3. 填写餐厅信息（菜系、人均、地址等）
4. 填写推荐理由
5. 点击「提交推荐」按钮
6. 等待管理员审核`
            },
            {
              id: 'review-recommendation',
              title: '餐厅推荐审核',
              content: `**权限要求**: 超级管理员

**操作步骤**:
1. 切换到「餐厅推荐审核」标签页
2. 查看待审核的餐厅推荐
3. 点击「审核通过」或「拒绝」
4. 拒绝时需填写拒绝原因`
            },
            {
              id: 'import-json',
              title: '导入JSON',
              content: `**权限要求**: 超级管理员

**操作步骤**:
1. 点击「导入JSON」按钮
2. 选择JSON文件
3. 系统自动解析并导入餐厅数据

**JSON格式要求**:
\`\`\`json
{
  "restaurants": [
    {
      "name": "川味馆",
      "cuisine_type": "川菜",
      "avg_price": 80,
      "rating": 4.5,
      "address": "北京市朝阳区xxx路",
      "phone": "010-xxxxxxx",
      "business_hours": "11:00-22:00",
      "has_private_room": true,
      "tags": ["辣", "川菜", "聚会"]
    }
  ]
}
\`\`\``
            }
          ]
        },
        {
          id: 'user-management',
          title: '用户管理',
          content: '',
          subsubsections: [
            {
              id: 'user-list',
              title: '用户列表',
              content: `- 搜索用户昵称
- 显示用户昵称、角色、部门、创建时间
- 支持编辑和删除操作`
            },
            {
              id: 'add-user',
              title: '添加用户',
              content: `1. 点击「添加用户」按钮
2. 填写昵称（必填）
3. 设置密码（默认为123456）
4. 选择角色
5. 选择部门
6. 点击「添加用户」按钮`
            },
            {
              id: 'batch-add-users',
              title: '批量添加用户',
              content: `**操作步骤**:
1. 点击「批量添加」按钮
2. 按格式输入用户列表：
   \`\`\`
   张三,abc123
   李四,xyz789
   王五
   \`\`\`
3. 点击「批量添加」按钮

**格式说明**:
- 每行一个用户
- 昵称和密码用逗号分隔
- 密码可选，默认为123456
- 用户将添加到当前用户所在部门`
            }
          ]
        },
        {
          id: 'department-management',
          title: '部门管理',
          content: '',
          subsubsections: [
            {
              id: 'manage-department',
              title: '管理部门',
              content: `**权限要求**: 超级管理员

**操作步骤**:
1. 点击「添加部门」按钮
2. 填写部门名称（必填）
3. 填写部门描述（可选）
4. 点击「添加部门」按钮

**删除部门**:
- 点击部门卡片上的删除图标
- 若部门存在用户，需先转移用户才能删除`
            }
          ]
        },
        {
          id: 'archives',
          title: '归档记录',
          content: '',
          subsubsections: [
            {
              id: 'archive-features',
              title: '功能特性',
              content: `- 按年份筛选
- 按月份筛选
- 按日期范围筛选
- 导出归档记录`
            },
            {
              id: 'archive-actions',
              title: '操作步骤',
              content: `1. 可使用高级筛选功能过滤记录
2. 点击「导出」按钮下载归档文件
3. 点击「清除筛选」重置筛选条件`
            }
          ]
        }
      ]
    },
    {
      id: 'scenarios',
      title: '常见操作场景',
      icon: BarChart3,
      subsections: [
        {
          id: 'scenario-organize',
          title: '组织部门聚餐投票',
          content: `**角色**: 组织者

**步骤**:
1. 登录系统，进入首页
2. 点击「发起投票」快速入口
3. 填写投票标题：「周五技术部聚餐投票」
4. 填写描述：「本周周五部门聚餐，请大家投票选择餐厅」
5. 设置投票时长：2小时
6. 选择聚餐日期：周五
7. 选择3-5家候选餐厅
8. 点击「发起投票」
9. 通知部门成员参与投票`
        },
        {
          id: 'scenario-participate',
          title: '参与投票',
          content: `**角色**: 普通成员

**步骤**:
1. 登录系统，在首页查看「我的投票状态」
2. 点击未参与的投票卡片
3. 点击「参与聚餐」按钮
4. 在餐厅列表中选择心仪的餐厅
5. 完成投票，可查看实时结果`
        },
        {
          id: 'scenario-recommend',
          title: '推荐新餐厅',
          content: `**角色**: 普通成员

**步骤**:
1. 进入餐厅管理页面
2. 点击「推荐餐厅」按钮
3. 填写餐厅信息
4. 说明推荐理由（如：味道好、价格实惠）
5. 提交推荐，等待审核`
        },
        {
          id: 'scenario-settlement',
          title: '结算聚餐费用',
          content: `**角色**: 组织者

**步骤**:
1. 投票结束后，进入投票详情页
2. 点击「设置结算金额」
3. 输入总金额
4. 输入报销额度（可选）
5. 系统自动计算每人应付金额
6. 点击「确认结算」
7. 上传收款码（可选）`
        },
        {
          id: 'scenario-history',
          title: '查看历史聚餐记录',
          content: `**角色**: 所有用户

**步骤**:
1. 进入归档记录页面
2. 使用筛选功能查找特定记录
3. 点击「导出」下载详细记录
4. 查看聚餐详情和参与人员`
        }
      ]
    },
    {
      id: 'permissions',
      title: '权限说明',
      icon: Users,
      subsections: [
        {
          id: 'permission-matrix',
          title: '权限矩阵',
          content: `| 功能 | 超级管理员 | 部门管理员 | 组织者 | 普通成员 |
|------|-----------|-----------|--------|----------|
| 登录系统 | ✓ | ✓ | ✓ | ✓ |
| 查看首页仪表板 | ✓ | ✓ | ✓ | ✓ |
| 参与投票 | ✓ | ✓ | ✓ | ✓ |
| 发起投票 | ✓ | ✓ | ✓ | ✗ |
| 结束/归档投票 | ✓ | ✓ | ✓ | ✗ |
| 设置结算金额 | ✓ | ✓ | ✓ | ✗ |
| 查看餐厅列表 | ✓ | ✓ | ✓ | ✓ |
| 推荐餐厅 | ✓ | ✓ | ✓ | ✓ |
| 添加/编辑/删除餐厅 | ✓ | ✗ | ✗ | ✗ |
| 审核餐厅推荐 | ✓ | ✗ | ✗ | ✗ |
| 查看用户列表 | ✓ | ✓ | ✗ | ✗ |
| 添加/编辑/删除用户 | ✓ | ✓ | ✗ | ✗ |
| 管理部门 | ✓ | ✗ | ✗ | ✗ |
| 查看归档记录 | ✓ | ✓ | ✓ | ✓ |
| 修改个人密码 | ✓ | ✓ | ✓ | ✓ |`
        },
        {
          id: 'isolation',
          title: '部门隔离说明',
          content: `- 不同部门的数据完全隔离
- 用户只能看到本部门的投票和餐厅
- 部门管理员只能管理本部门的用户`
        }
      ]
    },
    {
      id: 'faq',
      title: '常见问题与故障排除',
      icon: HelpCircle,
      subsections: [
        {
          id: 'faq-login',
          title: '登录时提示「账号或密码错误」？',
          content: `**可能原因及解决方法**:
- 确认使用正确的昵称（不是用户名）
- 确认密码输入正确，注意区分大小写
- 默认管理员账号：昵称「管理员」，密码「admin123」
- 若密码遗忘，请联系超级管理员重置`
        },
        {
          id: 'faq-password',
          title: '如何修改个人密码？',
          content: `**操作步骤**:
1. 登录系统后进入首页
2. 点击「修改密码」快速操作按钮
3. 输入当前密码
4. 输入新密码（至少6位）
5. 确认新密码
6. 点击「确认修改」`
        },
        {
          id: 'faq-multiple-votes',
          title: '可以同时发起多个投票吗？',
          content: `可以，同一部门可以同时存在多个进行中的投票。`
        },
        {
          id: 'faq-view-results',
          title: '投票结束后还可以查看结果吗？',
          content: `可以，投票结束后会自动归档，您可以随时在「归档记录」中查看历史投票结果。`
        },
        {
          id: 'faq-restaurant-review',
          title: '餐厅推荐提交后多久能审核通过？',
          content: `餐厅推荐需要超级管理员审核，审核通过后会自动添加到餐厅列表。建议联系管理员及时处理。`
        },
        {
          id: 'faq-export-archive',
          title: '如何导出投票归档记录？',
          content: `**操作步骤**:
1. 进入投票详情页或归档记录页
2. 找到要导出的投票记录
3. 点击「导出」按钮
4. 浏览器自动下载文本文件`
        },
        {
          id: 'faq-participate-change',
          title: '参与投票后可以取消或修改吗？',
          content: `可以，在投票结束前，您可以随时修改参与状态和投票选择。`
        },
        {
          id: 'faq-settlement-change',
          title: '结算金额设置错误可以修改吗？',
          content: `可以，组织者可以重新进入投票详情页修改结算金额。`
        },
        {
          id: 'faq-page-error',
          title: '页面显示异常或功能无法使用？',
          content: `**解决方法**:
1. 尝试刷新页面
2. 清除浏览器缓存后重试
3. 检查网络连接
4. 尝试使用其他浏览器
5. 联系系统管理员`
        }
      ]
    },
    {
      id: 'support',
      title: '技术支持',
      icon: AlertCircle,
      subsections: [
        {
          id: 'support-contact',
          title: '联系我们',
          content: `如遇到问题或有功能建议，请联系系统管理员。

**最后更新时间**: 2026年5月`
        }
      ]
    }
  ]
};

const ManualContent = ({ expandedSections, setExpandedSections, expandedSubsections, setExpandedSubsections, expandedSubsubsections, setExpandedSubsectionsState }) => {
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
    setExpandedSubsectionsState(prev => ({
      ...prev,
      [subsubsectionId]: !prev[subsubsectionId]
    }));
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setExpandedSections(prev => [...new Set([...prev, sectionId.split('-')[0]])]);
  };

  const renderTextWithBold = (text) => {
    if (!text.includes('**')) {
      return text;
    }
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => 
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="text-gray-800">{part.slice(2, -2)}</strong>
        : part
    );
  };

  const parseMarkdownTable = (lines) => {
    const tableLines = [];
    let inTable = false;
    
    for (const line of lines) {
      if (line.match(/^\|.*\|$/)) {
        tableLines.push(line);
        inTable = true;
      } else if (inTable) {
        break;
      }
    }
    
    if (tableLines.length < 2) return null;
    
    const headerRow = tableLines[0].split('|').filter(cell => cell.trim() !== '');
    const separatorRow = tableLines[1];
    const dataRows = tableLines.slice(2);
    
    const alignments = separatorRow.split('|').filter(cell => cell.trim() !== '').map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    });
    
    const parsedRows = dataRows.map(row => 
      row.split('|').filter(cell => cell.trim() !== '')
    );
    
    return { headerRow, alignments, dataRows: parsedRows };
  };

  const renderContent = (content) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const result = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      if (line.startsWith('- ')) {
        const textContent = line.slice(2);
        result.push(
          <li key={i} className="ml-4 text-gray-600 mb-1 flex items-start">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            <span>{renderTextWithBold(textContent)}</span>
          </li>
        );
        i++;
      } else if (line.startsWith('```')) {
        const isEnd = i > 0 && lines[i - 1]?.startsWith('```');
        if (isEnd) {
          i++;
          continue;
        }
        const codeBlock = content.split('```')[1];
        result.push(
          <pre key={i} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-2">
            <code>{codeBlock}</code>
          </pre>
        );
        i++;
      } else if (line.match(/^\|.*\|$/)) {
        const tableData = parseMarkdownTable(lines.slice(i));
        if (tableData) {
          result.push(
            <div key={i} className="overflow-x-auto my-2">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    {tableData.headerRow.map((header, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-300 ${
                          tableData.alignments[idx] === 'center' ? 'text-center' :
                          tableData.alignments[idx] === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {renderTextWithBold(header.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.dataRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-4 py-3 border-b border-gray-200 ${
                            tableData.alignments[cellIdx] === 'center' ? 'text-center' :
                            tableData.alignments[cellIdx] === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {renderTextWithBold(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          i += tableData.dataRows.length + 2;
        } else {
          result.push(
            <p key={i} className="text-gray-600 mb-2 whitespace-pre-wrap">
              {renderTextWithBold(line)}
            </p>
          );
          i++;
        }
      } else if (line.includes('**')) {
        result.push(
          <p key={i} className="text-gray-600 mb-2">
            {renderTextWithBold(line)}
          </p>
        );
        i++;
      } else {
        result.push(<p key={i} className="text-gray-600 mb-2">{line}</p>);
        i++;
      }
    }
    
    return result;
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 sm:p-8 mb-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Star className="w-8 h-8" />
          <h1 className="text-xl sm:text-2xl font-bold">{manualData.title}</h1>
        </div>
        <p className="text-orange-100">欢迎使用聚餐投票系统，本手册将帮助您快速上手</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-orange-500">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-800">{manualData.testAccounts.title}</h2>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          {renderContent(manualData.testAccounts.content)}
        </div>
      </div>

      {manualData.sections.map(section => (
        <section key={section.id} id={section.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <section.icon className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{section.title}</h2>
            </div>
            {expandedSections.includes(section.id) ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.includes(section.id) && section.subsections.map(subsection => (
            <div key={subsection.id} id={subsection.id} className="mb-4 last:mb-0">
              {subsection.subsubsections ? (
                <>
                  <button
                    onClick={() => toggleSubsection(subsection.id)}
                    className="w-full flex items-center justify-between text-left mb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Anchor className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-800">{subsection.title}</h3>
                    </div>
                    {expandedSubsections[subsection.id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {(expandedSubsections[subsection.id] !== false) && subsection.subsubsections.map(subsub => (
                    <div key={subsub.id} id={subsub.id} className="mb-3 last:mb-0">
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
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 ml-2 sm:ml-4">
                          {renderContent(subsub.content)}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-800 mb-2">{subsection.title}</h3>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    {renderContent(subsection.content)}
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      ))}

      <footer className="bg-gray-50 rounded-xl p-4 sm:p-6 mt-6 text-center text-gray-500 text-sm">
        <p>聚餐投票系统使用手册</p>
        <p className="mt-1">最后更新时间：2026年5月</p>
      </footer>
    </>
  );
};

const Manual = () => {
  const { currentUser } = useApp();
  const [expandedSections, setExpandedSections] = useState(['overview', 'quick-start']);
  const [expandedSubsections, setExpandedSubsections] = useState({});
  const [expandedSubsubsections, setExpandedSubsectionsState] = useState({});

  const content = (
    <ManualContent
      expandedSections={expandedSections}
      setExpandedSections={setExpandedSections}
      expandedSubsections={expandedSubsections}
      setExpandedSubsections={setExpandedSubsections}
      expandedSubsubsections={expandedSubsubsections}
      setExpandedSubsectionsState={setExpandedSubsectionsState}
    />
  );

  if (currentUser) {
    return <Layout>{content}</Layout>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Book className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-gray-800">聚餐投票系统 - 使用手册</span>
          </div>
          <a
            href="/"
            className="text-orange-500 hover:text-orange-600 font-medium text-sm"
          >
            返回登录
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto pt-16 px-4 pb-8">
        {content}
      </div>
    </div>
  );
};

export default Manual;
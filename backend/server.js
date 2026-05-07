require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const models = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

const log = (color, ...args) => {
  console.log(color + args.join(' ') + colors.reset);
};

const logRequest = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 500 ? colors.red : 
                       statusCode >= 400 ? colors.yellow : 
                       statusCode >= 300 ? colors.cyan : colors.green;
    
    log(colors.gray, `[${new Date().toLocaleTimeString()}]`);
    log(colors.blue, `${method}`);
    log(colors.magenta, `${originalUrl}`);
    log(statusColor, `${statusCode}`);
    log(colors.yellow, `${duration}ms`);
    console.log('');
  });
  
  next();
};

app.use(cors());
app.use(express.json());
app.use(logRequest);

const cacheConfig = {
  '/api/restaurants': { maxAge: 3600, description: '餐厅数据' },
  '/api/departments': { maxAge: 7200, description: '部门数据' },
  '/api/users': { maxAge: 1800, description: '用户数据' },
  '/api/votes': { maxAge: 0, description: '投票数据' },
  '/api/auth': { maxAge: 0, description: '认证数据' },
  '/api/recommendations': { maxAge: 300, description: '推荐数据' }
};

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    next();
    return;
  }

  let maxAge = 0;
  
  for (const [pathPrefix, config] of Object.entries(cacheConfig)) {
    if (req.path.startsWith(pathPrefix)) {
      maxAge = config.maxAge;
      break;
    }
  }

  if (maxAge > 0) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
    res.setHeader('Pragma', '');
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

app.get('/', (req, res) => {
  res.json({ message: '聚餐投票系统后端服务' });
});

app.use('/api', routes);

// 404 错误处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '请求的资源不存在' 
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  log(colors.red, `[错误] ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误', 
    error: err.message 
  });
});

// 进程未捕获异常处理
process.on('uncaughtException', (err) => {
  log(colors.red, `[未捕获异常] ${err.message}`);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  log(colors.red, `[未处理Promise拒绝] ${reason}`);
  console.error(promise);
});

const initializeDatabase = async () => {
  try {
    log(colors.cyan, '正在连接数据库...');
    
    await sequelize.authenticate();
    log(colors.green, '✓ 数据库连接成功');
    
    await sequelize.sync({ force: false });
    log(colors.green, '✓ 数据库表同步完成');
    
    await sequelize.query(`PRAGMA table_info(votes);`).then(async ([rows]) => {
      const hasDinnerDate = rows.some(row => row.name === 'dinner_date');
      
      if (!hasDinnerDate) {
        log(colors.yellow, '检测到缺少 dinner_date 字段，正在添加...');
        await sequelize.query(`ALTER TABLE votes ADD COLUMN dinner_date DATE;`);
        log(colors.green, '✓ dinner_date 字段添加成功');
      }
    });
    
    const bcrypt = require('bcrypt');
    
    const existingAdmin = await models.User.findOne({ where: { nickname: '管理员' } });
    if (!existingAdmin) {
      log(colors.yellow, '正在创建默认管理员账号...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await models.User.create({
        nickname: '管理员',
        password: hashedPassword,
        role: 'super_admin'
      });
      log(colors.green, '✓ 创建默认超级管理员账号');
    }

    const existingDepartments = await models.Department.count();
    if (existingDepartments === 0) {
      log(colors.yellow, '正在创建默认部门...');
      await models.Department.bulkCreate([
        { name: '研发部', description: '技术研发团队' },
        { name: '产品部', description: '产品设计团队' },
        { name: '市场部', description: '市场营销团队' },
        { name: '运营部', description: '运营管理团队' }
      ]);
      log(colors.green, '✓ 创建默认部门');
    }

    const existingUsers = await models.User.count();
    if (existingUsers === 1) {
      log(colors.yellow, '正在创建默认用户...');
      const departments = await models.Department.findAll();
      const dept1 = departments.find(d => d.name === '研发部');
      const dept2 = departments.find(d => d.name === '产品部');
      const dept3 = departments.find(d => d.name === '市场部');
      const dept4 = departments.find(d => d.name === '运营部');
      
      const hashedPassword = await bcrypt.hash('123456', 10);
      await models.User.bulkCreate([
        { nickname: '研发部', password: hashedPassword, role: 'dept_admin', department_id: dept1.id },
        { nickname: '产品部', password: hashedPassword, role: 'dept_admin', department_id: dept2.id },
        { nickname: '市场部', password: hashedPassword, role: 'dept_admin', department_id: dept3.id },
        { nickname: '运营部', password: hashedPassword, role: 'dept_admin', department_id: dept4.id },
        { nickname: '张三', password: hashedPassword, role: 'organizer', department_id: dept1.id },
        { nickname: '李四', password: hashedPassword, role: 'member', department_id: dept1.id },
        { nickname: '王五', password: hashedPassword, role: 'member', department_id: dept1.id },
        { nickname: '赵六', password: hashedPassword, role: 'member', department_id: dept2.id },
        { nickname: '钱七', password: hashedPassword, role: 'organizer', department_id: dept2.id },
        { nickname: '孙八', password: hashedPassword, role: 'member', department_id: dept3.id },
        { nickname: '周九', password: hashedPassword, role: 'organizer', department_id: dept3.id },
        { nickname: '吴十', password: hashedPassword, role: 'member', department_id: dept4.id }
      ]);
      log(colors.green, '✓ 创建默认用户（部门管理员、组织者、普通成员）');
    }

    const existingRestaurants = await models.Restaurant.count();
    if (existingRestaurants === 0) {
      log(colors.yellow, '正在导入餐厅数据...');
      const mockRestaurants = require('../src/data/mockData').mockRestaurants;
      await models.Restaurant.bulkCreate(mockRestaurants);
      log(colors.green, '✓ 导入餐厅数据');
    }

    log(colors.green, '\n数据库初始化完成！');
    
  } catch (error) {
    log(colors.red, '✗ 数据库初始化失败:', error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  console.log('');
  log(colors.bright, '========================================');
  log(colors.bright, '    聚餐投票系统 - 后端服务启动');
  log(colors.bright, '========================================');
  console.log('');
  
  await initializeDatabase();
  
  console.log('');
  log(colors.yellow, '启动服务器...');
  
  app.listen(PORT, () => {
    console.log('');
    log(colors.bright, '========================================');
    log(colors.green, `    服务器已启动成功！`);
    log(colors.green, `    运行地址: http://localhost:${PORT}`);
    log(colors.green, `    API地址: http://localhost:${PORT}/api`);
    log(colors.bright, '========================================');
    console.log('');
    log(colors.cyan, '等待请求...');
    log(colors.cyan, '按 Ctrl+C 停止服务\n');
  });
};

process.stdin.resume();

process.on('SIGINT', () => {
  console.log('');
  log(colors.yellow, '收到停止信号，正在关闭服务器...');
  process.exit(0);
});

startServer();
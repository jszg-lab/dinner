require('dotenv').config();
const sequelize = require('./config/database');

async function migrate() {
  console.log('正在检查并添加缺失的数据库字段...');
  
  try {
    await sequelize.query(`PRAGMA table_info(votes);`).then(async ([rows]) => {
      const hasDinnerDate = rows.some(row => row.name === 'dinner_date');
      
      if (!hasDinnerDate) {
        console.log('检测到缺少 dinner_date 字段，正在添加...');
        await sequelize.query(`ALTER TABLE votes ADD COLUMN dinner_date DATE;`);
        console.log('✓ dinner_date 字段添加成功');
      } else {
        console.log('✓ dinner_date 字段已存在');
      }
    });
    
    console.log('\n数据库迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error.message);
    process.exit(1);
  }
}

migrate();
const sequelize = require('./config/database');

async function addDinnerDateColumn() {
  try {
    await sequelize.query(`
      ALTER TABLE votes ADD COLUMN dinner_date DATE;
    `);
    console.log('成功添加 dinner_date 字段');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('dinner_date 字段已存在');
      process.exit(0);
    }
    console.error('添加字段失败:', error.message);
    process.exit(1);
  }
}

addDinnerDateColumn();
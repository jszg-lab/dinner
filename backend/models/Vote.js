const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'archived'),
    defaultValue: 'active'
  },
  dinner_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  restaurant_ids: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('restaurant_ids');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('restaurant_ids', JSON.stringify(value));
    }
  },
  results: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('results');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('results', JSON.stringify(value));
    }
  }
}, {
  tableName: 'votes',
  timestamps: true,
  underscored: true
});

module.exports = Vote;
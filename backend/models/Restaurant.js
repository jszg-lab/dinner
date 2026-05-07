const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cuisine_type: {
    type: DataTypes.STRING
  },
  avg_price: {
    type: DataTypes.INTEGER
  },
  rating: {
    type: DataTypes.FLOAT
  },
  review_count: {
    type: DataTypes.INTEGER
  },
  address: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  business_hours: {
    type: DataTypes.STRING
  },
  suitable_group_size: {
    type: DataTypes.STRING
  },
  has_private_room: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  private_room_info: {
    type: DataTypes.STRING
  },
  signature_dishes: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('signature_dishes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('signature_dishes', JSON.stringify(value));
    }
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    }
  },
  distance_to_center: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'restaurants',
  timestamps: true
});

module.exports = Restaurant;
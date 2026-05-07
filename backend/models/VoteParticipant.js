const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VoteParticipant = sequelize.define('VoteParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participating: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  restaurant_id: {
    type: DataTypes.UUID
  },
  voted_at: {
    type: DataTypes.DATE
  },
  confirmed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'vote_participants',
  timestamps: true,
  underscored: true
});

module.exports = VoteParticipant;
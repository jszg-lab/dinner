const Department = require('./Department');
const User = require('./User');
const Restaurant = require('./Restaurant');
const Vote = require('./Vote');
const VoteParticipant = require('./VoteParticipant');
const RestaurantRecommendation = require('./RestaurantRecommendation');
const Message = require('./Message');

User.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(User, { foreignKey: 'department_id' });

Vote.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });
Vote.belongsTo(Department, { foreignKey: 'department_id' });

VoteParticipant.belongsTo(Vote, { foreignKey: 'vote_id' });
VoteParticipant.belongsTo(User, { foreignKey: 'user_id' });
Vote.hasMany(VoteParticipant, { foreignKey: 'vote_id' });

RestaurantRecommendation.belongsTo(User, { foreignKey: 'recommended_by' });

Message.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  Department,
  User,
  Restaurant,
  Vote,
  VoteParticipant,
  RestaurantRecommendation,
  Message
};
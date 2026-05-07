const { RestaurantRecommendation, Restaurant, User, Message } = require('../models');

const getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await RestaurantRecommendation.findAll({
      include: [{ model: User, attributes: ['id', 'nickname'] }]
    });

    const recData = recommendations.map(rec => ({
      id: rec.id,
      name: rec.name,
      cuisine_type: rec.cuisine_type,
      avg_price: rec.avg_price,
      address: rec.address,
      phone: rec.phone,
      business_hours: rec.business_hours,
      suitable_group_size: rec.suitable_group_size,
      has_private_room: rec.has_private_room,
      private_room_info: rec.private_room_info,
      signature_dishes: rec.signature_dishes,
      tags: rec.tags,
      reason: rec.reason,
      status: rec.status,
      reject_reason: rec.reject_reason,
      recommended_by: rec.recommended_by,
      recommended_by_nickname: rec.User?.nickname || '',
      recommended_at: rec.createdAt
    }));

    res.json({ success: true, recommendations: recData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getPendingRecommendations = async (req, res) => {
  try {
    const recommendations = await RestaurantRecommendation.findAll({
      where: { status: 'pending' },
      include: [{ model: User, attributes: ['id', 'nickname'] }]
    });

    const recData = recommendations.map(rec => ({
      id: rec.id,
      name: rec.name,
      cuisine_type: rec.cuisine_type,
      avg_price: rec.avg_price,
      address: rec.address,
      phone: rec.phone,
      business_hours: rec.business_hours,
      suitable_group_size: rec.suitable_group_size,
      has_private_room: rec.has_private_room,
      private_room_info: rec.private_room_info,
      signature_dishes: rec.signature_dishes,
      tags: rec.tags,
      reason: rec.reason,
      recommended_by: rec.recommended_by,
      recommended_by_nickname: rec.User?.nickname || '',
      recommended_at: rec.createdAt
    }));

    res.json({ success: true, recommendations: recData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getUserRecommendations = async (req, res) => {
  try {
    const recommendations = await RestaurantRecommendation.findAll({
      where: { recommended_by: req.user.id },
      include: [{ model: User, attributes: ['id', 'nickname'] }]
    });

    const recData = recommendations.map(rec => ({
      id: rec.id,
      name: rec.name,
      cuisine_type: rec.cuisine_type,
      avg_price: rec.avg_price,
      address: rec.address,
      phone: rec.phone,
      business_hours: rec.business_hours,
      suitable_group_size: rec.suitable_group_size,
      has_private_room: rec.has_private_room,
      private_room_info: rec.private_room_info,
      signature_dishes: rec.signature_dishes,
      tags: rec.tags,
      reason: rec.reason,
      status: rec.status,
      reject_reason: rec.reject_reason,
      recommended_at: rec.createdAt
    }));

    res.json({ success: true, recommendations: recData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const createRecommendation = async (req, res) => {
  try {
    const { 
      name, cuisine_type, avg_price, address, phone, 
      business_hours, suitable_group_size, has_private_room, 
      private_room_info, signature_dishes, tags, reason 
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '请提供餐厅名称' });
    }

    const existingRestaurant = await Restaurant.findOne({ 
      where: { name: name } 
    });
    if (existingRestaurant) {
      return res.status(400).json({ success: false, message: '该餐厅已存在于餐厅池中' });
    }

    const existingRecommendation = await RestaurantRecommendation.findOne({ 
      where: { name: name, status: 'pending' } 
    });
    if (existingRecommendation) {
      return res.status(400).json({ success: false, message: '该餐厅已有待审核的推荐，请等待管理员审核' });
    }

    const recommendation = await RestaurantRecommendation.create({
      name,
      cuisine_type,
      avg_price,
      address,
      phone,
      business_hours,
      suitable_group_size,
      has_private_room: has_private_room || false,
      private_room_info,
      signature_dishes: signature_dishes || [],
      tags: tags || [],
      reason,
      recommended_by: req.user.id,
      status: 'pending'
    });

    res.status(201).json({ 
      success: true, 
      recommendation: {
        id: recommendation.id,
        name: recommendation.name,
        status: recommendation.status,
        recommended_at: recommendation.createdAt
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const approveRecommendation = async (req, res) => {
  try {
    const recommendation = await RestaurantRecommendation.findByPk(req.params.id);
    if (!recommendation || recommendation.status !== 'pending') {
      return res.status(400).json({ success: false, message: '推荐不存在或状态错误' });
    }

    const restaurant = await Restaurant.create({
      name: recommendation.name,
      cuisine_type: recommendation.cuisine_type,
      avg_price: recommendation.avg_price,
      address: recommendation.address,
      phone: recommendation.phone,
      business_hours: recommendation.business_hours,
      suitable_group_size: recommendation.suitable_group_size,
      has_private_room: recommendation.has_private_room,
      private_room_info: recommendation.private_room_info,
      signature_dishes: recommendation.signature_dishes,
      tags: recommendation.tags
    });

    recommendation.status = 'approved';
    await recommendation.save();

    await Message.create({
      user_id: recommendation.recommended_by,
      title: '餐厅推荐审核通过',
      content: `您推荐的餐厅「${recommendation.name}」已通过审核，现已加入餐厅池。`,
      type: 'recommendation_approved',
      reference_id: recommendation.id
    });

    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const rejectRecommendation = async (req, res) => {
  try {
    const { reason } = req.body;
    const recommendation = await RestaurantRecommendation.findByPk(req.params.id);
    if (!recommendation || recommendation.status !== 'pending') {
      return res.status(400).json({ success: false, message: '推荐不存在或状态错误' });
    }

    recommendation.status = 'rejected';
    recommendation.reject_reason = reason;
    await recommendation.save();

    await Message.create({
      user_id: recommendation.recommended_by,
      title: '餐厅推荐未通过审核',
      content: `您推荐的餐厅「${recommendation.name}」未通过审核。\n\n拒绝原因：${reason}`,
      type: 'recommendation_rejected',
      reference_id: recommendation.id
    });

    res.json({ success: true, message: '已拒绝' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await RestaurantRecommendation.findByPk(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: '推荐不存在' });
    }

    await recommendation.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = { 
  getAllRecommendations, 
  getPendingRecommendations, 
  getUserRecommendations,
  createRecommendation, 
  approveRecommendation, 
  rejectRecommendation, 
  deleteRecommendation 
};
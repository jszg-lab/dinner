const { Restaurant } = require('../models');

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json({ success: true, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: '餐厅不存在' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const { 
      name, cuisine_type, avg_price, rating, review_count, 
      address, phone, business_hours, suitable_group_size,
      has_private_room, private_room_info, signature_dishes, tags,
      distance_to_center 
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '请提供餐厅名称' });
    }

    const restaurant = await Restaurant.create({
      name,
      cuisine_type,
      avg_price,
      rating,
      review_count,
      address,
      phone,
      business_hours,
      suitable_group_size,
      has_private_room: has_private_room || false,
      private_room_info,
      signature_dishes: signature_dishes || [],
      tags: tags || [],
      distance_to_center
    });

    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: '餐厅不存在' });
    }

    const { 
      name, cuisine_type, avg_price, rating, review_count, 
      address, phone, business_hours, suitable_group_size,
      has_private_room, private_room_info, signature_dishes, tags,
      distance_to_center 
    } = req.body;

    if (name !== undefined) restaurant.name = name;
    if (cuisine_type !== undefined) restaurant.cuisine_type = cuisine_type;
    if (avg_price !== undefined) restaurant.avg_price = avg_price;
    if (rating !== undefined) restaurant.rating = rating;
    if (review_count !== undefined) restaurant.review_count = review_count;
    if (address !== undefined) restaurant.address = address;
    if (phone !== undefined) restaurant.phone = phone;
    if (business_hours !== undefined) restaurant.business_hours = business_hours;
    if (suitable_group_size !== undefined) restaurant.suitable_group_size = suitable_group_size;
    if (has_private_room !== undefined) restaurant.has_private_room = has_private_room;
    if (private_room_info !== undefined) restaurant.private_room_info = private_room_info;
    if (signature_dishes !== undefined) restaurant.signature_dishes = signature_dishes;
    if (tags !== undefined) restaurant.tags = tags;
    if (distance_to_center !== undefined) restaurant.distance_to_center = distance_to_center;

    await restaurant.save();
    res.json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: '餐厅不存在' });
    }

    await restaurant.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = { getAllRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant };
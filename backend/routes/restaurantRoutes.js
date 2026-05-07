const express = require('express');
const router = express.Router();
const { getAllRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, getAllRestaurants);
router.get('/:id', authenticateToken, getRestaurantById);
router.post('/', authenticateToken, requireAdmin, createRestaurant);
router.put('/:id', authenticateToken, requireAdmin, updateRestaurant);
router.delete('/:id', authenticateToken, requireAdmin, deleteRestaurant);

module.exports = router;
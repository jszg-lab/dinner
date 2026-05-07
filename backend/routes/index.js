const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const voteRoutes = require('./voteRoutes');
const departmentRoutes = require('./departmentRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const messageRoutes = require('./messageRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/votes', voteRoutes);
router.use('/departments', departmentRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
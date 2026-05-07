const express = require('express');
const router = express.Router();
const { getAllRecommendations, getPendingRecommendations, getUserRecommendations, createRecommendation, approveRecommendation, rejectRecommendation, deleteRecommendation } = require('../controllers/recommendationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, getAllRecommendations);
router.get('/pending', authenticateToken, requireAdmin, getPendingRecommendations);
router.get('/my', authenticateToken, getUserRecommendations);
router.post('/', authenticateToken, createRecommendation);
router.post('/:id/approve', authenticateToken, requireAdmin, approveRecommendation);
router.post('/:id/reject', authenticateToken, requireAdmin, rejectRecommendation);
router.delete('/:id', authenticateToken, requireAdmin, deleteRecommendation);

module.exports = router;
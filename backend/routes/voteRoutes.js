const express = require('express');
const router = express.Router();
const { getAllVotes, getVoteById, createVote, updateVote, deleteVote, castVote, confirmParticipation } = require('../controllers/voteController');
const { authenticateToken, requireOrganizerOrHigher } = require('../middleware/auth');

router.get('/', authenticateToken, getAllVotes);
router.get('/:id', authenticateToken, getVoteById);
router.post('/', authenticateToken, requireOrganizerOrHigher, createVote);
router.put('/:id', authenticateToken, requireOrganizerOrHigher, updateVote);
router.delete('/:id', authenticateToken, requireOrganizerOrHigher, deleteVote);
router.post('/:id/vote', authenticateToken, castVote);
router.post('/:id/participate', authenticateToken, confirmParticipation);

module.exports = router;
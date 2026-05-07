const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', messageController.getUserMessages);
router.get('/unread-count', messageController.getUnreadMessageCount);
router.put('/:id/read', messageController.markMessageAsRead);
router.put('/read-all', messageController.markAllMessagesAsRead);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
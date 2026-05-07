const { Message } = require('../models');

const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    const messageData = messages.map(msg => ({
      id: msg.id,
      title: msg.title,
      content: msg.content,
      type: msg.type,
      read: msg.read,
      reference_id: msg.reference_id,
      created_at: msg.createdAt
    }));

    res.json({ success: true, messages: messageData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.count({
      where: { user_id: req.user.id, read: false }
    });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message || message.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: '消息不存在' });
    }

    message.read = true;
    await message.save();

    res.json({ success: true, message: '已标记为已读' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const markAllMessagesAsRead = async (req, res) => {
  try {
    await Message.update(
      { read: true },
      { where: { user_id: req.user.id } }
    );

    res.json({ success: true, message: '所有消息已标记为已读' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message || message.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: '消息不存在' });
    }

    await message.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = {
  getUserMessages,
  getUnreadMessageCount,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteMessage
};
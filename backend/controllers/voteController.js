const { Vote, VoteParticipant, User, Department, Restaurant } = require('../models');

const getAllVotes = async (req, res) => {
  try {
    const votes = await Vote.findAll({
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'nickname'] },
        { model: Department },
        { model: VoteParticipant, include: [{ model: User, attributes: ['id', 'nickname'] }] }
      ]
    });

    const voteData = votes.map(vote => {
      const voteJson = vote.toJSON();
      console.log('投票数据:', voteJson.id, 'dinner_date:', voteJson.dinner_date, 'createdAt:', voteJson.createdAt);
      
      return {
        ...voteJson,
        participants: vote.VoteParticipants.map(p => ({
          id: p.id,
          user_id: p.user_id,
          user_nickname: p.User?.nickname || '',
          participating: p.participating,
          restaurant_id: p.restaurant_id,
          voted_at: p.voted_at,
          confirmed_at: p.confirmed_at
        }))
      };
    });

    res.json({ success: true, votes: voteData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getVoteById = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'nickname'] },
        { model: Department },
        { model: VoteParticipant, include: [{ model: User, attributes: ['id', 'nickname'] }] }
      ]
    });

    if (!vote) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }

    const voteData = {
      ...vote.toJSON(),
      participants: vote.VoteParticipants.map(p => ({
        id: p.id,
        user_id: p.user_id,
        user_nickname: p.User?.nickname || '',
        participating: p.participating,
        restaurant_id: p.restaurant_id,
        voted_at: p.voted_at,
        confirmed_at: p.confirmed_at
      }))
    };

    res.json({ success: true, vote: voteData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const createVote = async (req, res) => {
  try {
    const { title, description, department_id, restaurant_ids, dinner_date } = req.body;

    if (!title || !department_id || !restaurant_ids || !Array.isArray(restaurant_ids) || !dinner_date) {
      return res.status(400).json({ success: false, message: '请提供必要的投票信息' });
    }

    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(400).json({ success: false, message: '部门不存在' });
    }

    const departmentUsers = await User.findAll({ where: { department_id } });

    console.log('创建投票 - dinner_date:', dinner_date, '类型:', typeof dinner_date);
    
    const vote = await Vote.create({
      title,
      description,
      department_id,
      organizer_id: req.user.id,
      restaurant_ids,
      status: 'active',
      results: {},
      dinner_date: new Date(dinner_date)
    });

    const participants = departmentUsers.map(user => ({
      vote_id: vote.id,
      user_id: user.id,
      participating: false,
      restaurant_id: null
    }));

    await VoteParticipant.bulkCreate(participants);

    const voteData = {
      ...vote.toJSON(),
      participants: participants.map(p => ({
        id: null,
        user_id: p.user_id,
        user_nickname: departmentUsers.find(u => u.id === p.user_id)?.nickname || '',
        participating: p.participating,
        restaurant_id: p.restaurant_id
      }))
    };

    res.status(201).json({ success: true, vote: voteData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const updateVote = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id);
    if (!vote) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }

    const { title, description, status, restaurant_ids, dinner_date } = req.body;

    if (title !== undefined) vote.title = title;
    if (description !== undefined) vote.description = description;
    if (status !== undefined) vote.status = status;
    if (restaurant_ids !== undefined) vote.restaurant_ids = restaurant_ids;
    if (dinner_date !== undefined) vote.dinner_date = dinner_date;

    await vote.save();
    res.json({ success: true, vote });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const deleteVote = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id);
    if (!vote) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }

    await VoteParticipant.destroy({ where: { vote_id: vote.id } });
    await vote.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const castVote = async (req, res) => {
  try {
    const { restaurant_id } = req.body;
    const vote = await Vote.findByPk(req.params.id);

    if (!vote) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }

    if (vote.status !== 'active') {
      return res.status(400).json({ success: false, message: '投票未进行中' });
    }

    let participant = await VoteParticipant.findOne({
      where: { vote_id: vote.id, user_id: req.user.id }
    });

    if (!participant) {
      participant = await VoteParticipant.create({
        vote_id: vote.id,
        user_id: req.user.id,
        participating: true
      });
    }

    participant.restaurant_id = restaurant_id;
    participant.voted_at = new Date();
    await participant.save();

    const participants = await VoteParticipant.findAll({ where: { vote_id: vote.id } });
    const results = {};
    vote.restaurant_ids.forEach(rid => {
      results[rid] = participants.filter(p => p.restaurant_id === rid).length;
    });

    vote.results = results;
    await vote.save();

    res.json({ success: true, message: '投票成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const confirmParticipation = async (req, res) => {
  try {
    const { participating } = req.body;
    const vote = await Vote.findByPk(req.params.id);

    if (!vote) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }

    let participant = await VoteParticipant.findOne({
      where: { vote_id: vote.id, user_id: req.user.id }
    });

    if (!participant) {
      participant = await VoteParticipant.create({
        vote_id: vote.id,
        user_id: req.user.id
      });
    }

    participant.participating = participating;
    participant.confirmed_at = participating ? new Date() : null;
    if (!participating) {
      participant.restaurant_id = null;
      participant.voted_at = null;
    }
    await participant.save();

    res.json({ success: true, message: '操作成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = { getAllVotes, getVoteById, createVote, updateVote, deleteVote, castVote, confirmParticipation };
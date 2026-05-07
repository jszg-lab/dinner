const bcrypt = require('bcrypt');
const { User, Department } = require('../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Department }],
      attributes: { exclude: ['password'] }
    });
    
    const userData = users.map(user => ({
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      department_id: user.department_id,
      department: user.Department ? { id: user.Department.id, name: user.Department.name } : null,
      created_at: user.createdAt
    }));

    res.json({ success: true, users: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Department }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const userData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      department_id: user.department_id,
      department: user.Department ? { id: user.Department.id, name: user.Department.name } : null,
      created_at: user.createdAt
    };

    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { nickname, password, role = 'member', department_id } = req.body;

    if (!nickname || !password) {
      return res.status(400).json({ success: false, message: '请提供昵称和密码' });
    }

    const existingUser = await User.findOne({ where: { nickname } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '该昵称已被使用' });
    }

    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(400).json({ success: false, message: '部门不存在' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      nickname,
      password: hashedPassword,
      role,
      department_id
    });

    const userData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      department_id: user.department_id,
      created_at: user.createdAt
    };

    res.status(201).json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { nickname, password, role, department_id } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    if (nickname && nickname !== user.nickname) {
      const existingUser = await User.findOne({ where: { nickname } });
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(400).json({ success: false, message: '该昵称已被使用' });
      }
      user.nickname = nickname;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      user.role = role;
    }

    if (department_id !== undefined) {
      if (department_id) {
        const department = await Department.findByPk(department_id);
        if (!department) {
          return res.status(400).json({ success: false, message: '部门不存在' });
        }
      }
      user.department_id = department_id;
    }

    await user.save();

    const userData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      department_id: user.department_id,
      created_at: user.createdAt
    };

    res.json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    await user.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
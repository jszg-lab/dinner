const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Department } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, nickname: user.nickname, role: user.role, department_id: user.department_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const login = async (req, res) => {
  try {
    const { nickname, password } = req.body;
    
    if (!nickname || !password) {
      return res.status(400).json({ success: false, message: '请输入昵称和密码' });
    }

    const user = await User.findOne({ 
      where: { nickname },
      include: [{ model: Department }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: '昵称或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '昵称或密码错误' });
    }

    const token = generateToken(user);
    
    const userData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      department_id: user.department_id,
      department: user.Department ? { id: user.Department.id, name: user.Department.name } : null
    };

    res.json({ success: true, user: userData, token });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const register = async (req, res) => {
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

    const token = generateToken(user);
    
    const userData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      department_id: user.department_id
    };

    res.status(201).json({ success: true, user: userData, token });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: '退出成功' });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Department }]
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

module.exports = { login, register, logout, getCurrentUser };
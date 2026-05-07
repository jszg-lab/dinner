const { Department, User } = require('../models');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{ model: User, attributes: ['id', 'nickname', 'role'] }]
    });

    const deptData = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      users: dept.Users.map(u => ({ id: u.id, nickname: u.nickname, role: u.role })),
      createdAt: dept.createdAt
    }));

    res.json({ success: true, departments: deptData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'nickname', 'role'] }]
    });

    if (!department) {
      return res.status(404).json({ success: false, message: '部门不存在' });
    }

    const deptData = {
      id: department.id,
      name: department.name,
      description: department.description,
      users: department.Users.map(u => ({ id: u.id, nickname: u.nickname, role: u.role })),
      createdAt: department.createdAt
    };

    res.json({ success: true, department: deptData });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '请提供部门名称' });
    }

    const department = await Department.create({ name, description });
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: '部门不存在' });
    }

    const { name, description } = req.body;

    if (name !== undefined) department.name = name;
    if (description !== undefined) department.description = description;

    await department.save();
    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: '部门不存在' });
    }

    const users = await User.findAll({ where: { department_id: department.id } });
    if (users.length > 0) {
      return res.status(400).json({ success: false, message: '请先移除该部门下的所有用户' });
    }

    await department.destroy();
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };
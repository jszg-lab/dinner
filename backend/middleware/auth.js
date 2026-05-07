const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '访问被拒绝，未提供令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: '权限不足，需要超级管理员权限' });
  }
  next();
};

const requireDeptAdminOrHigher = (req, res, next) => {
  if (!['super_admin', 'dept_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: '权限不足，需要部门管理员或超级管理员权限' });
  }
  next();
};

const requireOrganizerOrHigher = (req, res, next) => {
  if (!['super_admin', 'dept_admin', 'organizer'].includes(req.user.role)) {
    return res.status(403).json({ message: '权限不足，需要组织者及以上权限' });
  }
  next();
};

module.exports = { 
  authenticateToken, 
  requireRole,
  requireAdmin,
  requireDeptAdminOrHigher,
  requireOrganizerOrHigher
};
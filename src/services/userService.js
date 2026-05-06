import { getItem, setItem, generateId, STORAGE_KEYS } from '../utils/storage.js';
import { initialAdmin, initialDepartments } from '../data/mockData.js';
import { validateNickname, validatePassword } from '../utils/validators.js';

function migrateData() {
  let existingUsers = getItem(STORAGE_KEYS.USERS);
  let needsMigration = false;

  if (existingUsers && existingUsers.length > 0) {
    existingUsers = existingUsers.map(user => {
      if (user.username && !user.nickname) {
        needsMigration = true;
        return {
          ...user,
          nickname: user.username,
          departmentId: user.departmentId || null,
        };
      }
      if (!user.departmentId) {
        user.departmentId = null;
        needsMigration = true;
      }
      return user;
    });

    if (needsMigration) {
      setItem(STORAGE_KEYS.USERS, existingUsers);
    }
  } else {
    setItem(STORAGE_KEYS.USERS, [initialAdmin]);
  }

  let existingDepts = getItem(STORAGE_KEYS.DEPARTMENTS);
  if (!existingDepts) {
    setItem(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
  }
}

function initializeData() {
  migrateData();
}

function getUsers() {
  initializeData();
  return getItem(STORAGE_KEYS.USERS) || [];
}

function saveUsers(users) {
  setItem(STORAGE_KEYS.USERS, users);
}

function getDepartments() {
  initializeData();
  return getItem(STORAGE_KEYS.DEPARTMENTS) || [];
}

function saveDepartments(departments) {
  setItem(STORAGE_KEYS.DEPARTMENTS, departments);
}

export const userService = {
  login(nickname, password) {
    if (!nickname || !password) {
      throw new Error('昵称和密码不能为空');
    }

    const users = getUsers();
    const user = users.find(u => u.nickname === nickname && u.password === password);
    
    if (!user) {
      throw new Error('昵称或密码错误');
    }

    setItem(STORAGE_KEYS.CURRENT_USER, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  logout() {
    setItem(STORAGE_KEYS.CURRENT_USER, null);
  },

  getCurrentUser() {
    const user = getItem(STORAGE_KEYS.CURRENT_USER);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  addUser(nickname, password, role, departmentId) {
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.isValid) {
      throw new Error(nicknameValidation.message);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    const users = getUsers();
    const existingUser = users.find(u => u.nickname === nickname);
    if (existingUser) {
      throw new Error('该昵称已存在');
    }

    const newUser = {
      id: generateId(),
      nickname,
      password,
      role: role || 'member',
      departmentId: departmentId || null,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  addUsersBatch(usersData) {
    const results = { success: 0, failed: 0, errors: [] };
    const users = getUsers();

    usersData.forEach((userData, index) => {
      try {
        const { nickname, password, role, departmentId } = userData;
        
        if (!nickname || nickname.trim().length < 2) {
          results.failed++;
          results.errors.push(`第${index + 1}行: 昵称至少需要2个字符`);
          return;
        }

        if (!password || password.length < 6) {
          results.failed++;
          results.errors.push(`第${index + 1}行: 密码至少需要6个字符`);
          return;
        }

        if (users.find(u => u.nickname === nickname)) {
          results.failed++;
          results.errors.push(`第${index + 1}行: 昵称"${nickname}"已存在`);
          return;
        }

        const newUser = {
          id: generateId(),
          nickname: nickname.trim(),
          password,
          role: role || 'member',
          departmentId: departmentId || null,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`第${index + 1}行: ${error.message}`);
      }
    });

    saveUsers(users);
    return results;
  },

  updateUser(userId, data) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    if (data.nickname && data.nickname !== users[userIndex].nickname) {
      const nicknameValidation = validateNickname(data.nickname);
      if (!nicknameValidation.isValid) {
        throw new Error(nicknameValidation.message);
      }
      
      if (users.find(u => u.nickname === data.nickname)) {
        throw new Error('该昵称已存在');
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      ...data,
    };

    saveUsers(users);

    const currentUser = getItem(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === userId) {
      setItem(STORAGE_KEYS.CURRENT_USER, users[userIndex]);
    }

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  },

  updateUserRole(userId, role) {
    return this.updateUser(userId, { role });
  },

  updateUserDepartment(userId, departmentId) {
    return this.updateUser(userId, { departmentId });
  },

  deleteUser(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }

    if (users[userIndex].role === 'admin') {
      throw new Error('不能删除管理员账户');
    }

    users.splice(userIndex, 1);
    saveUsers(users);
  },

  getAllUsers() {
    const users = getUsers();
    return users.map(({ password: _, ...user }) => user);
  },

  getUsersByDepartment(departmentId) {
    const users = getUsers();
    return users
      .filter(u => u.departmentId === departmentId)
      .map(({ password: _, ...user }) => user);
  },

  checkNicknameExists(nickname) {
    const users = getUsers();
    return users.some(u => u.nickname === nickname);
  },

  getDepartmentById(departmentId) {
    const departments = getDepartments();
    return departments.find(d => d.id === departmentId) || null;
  },

  getAllDepartments() {
    return getDepartments();
  },

  createDepartment(name) {
    const departments = getDepartments();
    
    if (departments.find(d => d.name === name)) {
      throw new Error('部门名称已存在');
    }

    const newDepartment = {
      id: generateId(),
      name,
      adminId: null,
      createdAt: new Date().toISOString(),
    };

    departments.push(newDepartment);
    saveDepartments(departments);
    return newDepartment;
  },

  updateDepartment(departmentId, data) {
    const departments = getDepartments();
    const index = departments.findIndex(d => d.id === departmentId);
    
    if (index === -1) {
      throw new Error('部门不存在');
    }

    departments[index] = {
      ...departments[index],
      ...data,
    };

    saveDepartments(departments);
    return departments[index];
  },

  deleteDepartment(departmentId) {
    const departments = getDepartments();
    const index = departments.findIndex(d => d.id === departmentId);
    
    if (index === -1) {
      throw new Error('部门不存在');
    }

    const users = getUsers();
    const hasUsers = users.some(u => u.departmentId === departmentId);
    if (hasUsers) {
      throw new Error('该部门下还有用户，无法删除');
    }

    departments.splice(index, 1);
    saveDepartments(departments);
  },

  setDepartmentAdmin(departmentId, adminId) {
    return this.updateDepartment(departmentId, { adminId });
  },

  getDepartmentName(departmentId) {
    const dept = this.getDepartmentById(departmentId);
    return dept ? dept.name : '未分配部门';
  },

  resetToDefault() {
    setItem(STORAGE_KEYS.USERS, [initialAdmin]);
    setItem(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    setItem(STORAGE_KEYS.CURRENT_USER, null);
  },
};

export default userService;

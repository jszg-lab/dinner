import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (nickname, password) => {
    const loggedInUser = userService.login(nickname, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (nickname, password, displayName) => {
    const newUser = userService.addUser(nickname, password, 'member', null);
    userService.logout();
    const loggedInUser = userService.login(nickname, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    userService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = userService.getCurrentUser();
    setUser(currentUser);
  };

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const isMember = user?.role === 'member';
  const canCreateVote = user?.role === 'admin' || user?.role === 'organizer';
  const canManageRestaurants = user?.role === 'admin';
  const canManageUsers = user?.role === 'admin';

  const userDepartmentId = user?.departmentId;
  const userDepartmentName = user?.departmentId 
    ? userService.getDepartmentName(user.departmentId) 
    : null;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin,
    isOrganizer,
    isMember,
    canCreateVote,
    canManageRestaurants,
    canManageUsers,
    userDepartmentId,
    userDepartmentName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

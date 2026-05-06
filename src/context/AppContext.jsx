import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { mockUsers, mockRestaurants, mockDepartments, mockVotes } from '../data/mockData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [votes, setVotes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [restaurantRecommendations, setRestaurantRecommendations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUsers = storage.getItem('USERS');
    const storedRestaurants = storage.getItem('RESTAURANTS');
    const storedVotes = storage.getItem('VOTES');
    const storedDepartments = storage.getItem('DEPARTMENTS');
    const storedRecommendations = storage.getItem('RESTAURANT_RECOMMENDATIONS');
    const storedCurrentUser = storage.getItem('CURRENT_USER');

    if (!storedUsers || storedUsers.length === 0) {
      storage.setItem('USERS', mockUsers);
      setUsers(mockUsers);
    } else {
      setUsers(storedUsers);
    }

    if (!storedRestaurants || storedRestaurants.length === 0) {
      storage.setItem('RESTAURANTS', mockRestaurants);
      setRestaurants(mockRestaurants);
    } else {
      setRestaurants(storedRestaurants);
    }

    if (!storedVotes) {
      storage.setItem('VOTES', mockVotes);
      setVotes(mockVotes);
    } else {
      setVotes(storedVotes);
    }

    if (!storedDepartments || storedDepartments.length === 0) {
      storage.setItem('DEPARTMENTS', mockDepartments);
      setDepartments(mockDepartments);
    } else {
      setDepartments(storedDepartments);
    }

    if (!storedRecommendations) {
      storage.setItem('RESTAURANT_RECOMMENDATIONS', []);
      setRestaurantRecommendations([]);
    } else {
      setRestaurantRecommendations(storedRecommendations);
    }

    if (storedCurrentUser) {
      setCurrentUser(storedCurrentUser);
    }
  }, []);

  const login = (nickname, password) => {
    const user = users.find(u => u.nickname === nickname && u.password === password);
    if (user) {
      setCurrentUser(user);
      storage.setItem('CURRENT_USER', user);
      return { success: true, user };
    }
    return { success: false, message: '昵称或密码错误' };
  };

  const logout = () => {
    setCurrentUser(null);
    storage.removeItem('CURRENT_USER');
  };

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: `u${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storage.setItem('USERS', updatedUsers);
    return newUser;
  };

  const updateUser = (userId, updates) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updatedUsers);
    storage.setItem('USERS', updatedUsers);
    if (currentUser?.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      setCurrentUser(updatedUser);
      storage.setItem('CURRENT_USER', updatedUser);
    }
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    storage.setItem('USERS', updatedUsers);
  };

  const addRestaurant = (restaurant) => {
    const newRestaurant = {
      ...restaurant,
      id: `r${Date.now()}`,
      tags: restaurant.tags || []
    };
    const updatedRestaurants = [...restaurants, newRestaurant];
    setRestaurants(updatedRestaurants);
    storage.setItem('RESTAURANTS', updatedRestaurants);
    return newRestaurant;
  };

  const updateRestaurant = (restaurantId, updates) => {
    const updatedRestaurants = restaurants.map(r => 
      r.id === restaurantId ? { ...r, ...updates } : r
    );
    setRestaurants(updatedRestaurants);
    storage.setItem('RESTAURANTS', updatedRestaurants);
  };

  const deleteRestaurant = (restaurantId) => {
    const updatedRestaurants = restaurants.filter(r => r.id !== restaurantId);
    setRestaurants(updatedRestaurants);
    storage.setItem('RESTAURANTS', updatedRestaurants);
  };

  const addDepartment = (department) => {
    const newDepartment = {
      ...department,
      id: `d${Date.now()}`
    };
    const updatedDepartments = [...departments, newDepartment];
    setDepartments(updatedDepartments);
    storage.setItem('DEPARTMENTS', updatedDepartments);
    return newDepartment;
  };

  const deleteDepartment = (departmentId) => {
    const updatedDepartments = departments.filter(d => d.id !== departmentId);
    setDepartments(updatedDepartments);
    storage.setItem('DEPARTMENTS', updatedDepartments);
  };

  const createVote = (voteData) => {
    const departmentUsers = users.filter(u => u.department_id === voteData.department_id);
    const initialParticipants = departmentUsers.map(user => ({
      user_id: user.id,
      user_nickname: user.nickname,
      participating: false,
      restaurant_id: null
    }));
    
    const newVote = {
      ...voteData,
      id: `v${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
      participants: initialParticipants,
      results: {}
    };
    const updatedVotes = [...votes, newVote];
    setVotes(updatedVotes);
    storage.setItem('VOTES', updatedVotes);
    return newVote;
  };

  const updateVote = (voteId, updates) => {
    const updatedVotes = votes.map(v => 
      v.id === voteId ? { ...v, ...updates } : v
    );
    setVotes(updatedVotes);
    storage.setItem('VOTES', updatedVotes);
  };

  const deleteVote = (voteId) => {
    const updatedVotes = votes.filter(v => v.id !== voteId);
    setVotes(updatedVotes);
    storage.setItem('VOTES', updatedVotes);
  };

  const castVote = (voteId, restaurantId) => {
    const updatedVotes = votes.map(v => {
      if (v.id === voteId) {
        const existingVote = v.participants.find(p => p.user_id === currentUser.id);
        let newParticipants;
        if (existingVote) {
          newParticipants = v.participants.map(p => 
            p.user_id === currentUser.id 
              ? { ...p, restaurant_id: restaurantId }
              : p
          );
        } else {
          newParticipants = [...v.participants, {
            user_id: currentUser.id,
            user_nickname: currentUser.nickname,
            restaurant_id,
            voted_at: new Date().toISOString()
          }];
        }

        const results = { ...v.results };
        Object.keys(results).forEach(key => {
          results[key] = newParticipants.filter(p => p.restaurant_id === key).length;
        });

        if (!results[restaurantId]) {
          results[restaurantId] = 0;
        }
        results[restaurantId] = newParticipants.filter(p => p.restaurant_id === restaurantId).length;

        return { ...v, participants: newParticipants, results };
      }
      return v;
    });
    setVotes(updatedVotes);
    storage.setItem('VOTES', updatedVotes);
  };

  const confirmParticipation = (voteId, participating) => {
    const updatedVotes = votes.map(v => {
      if (v.id === voteId) {
        const existingParticipant = v.participants.find(p => p.user_id === currentUser.id);
        if (participating) {
          if (!existingParticipant) {
            return {
              ...v,
              participants: [...v.participants, {
                user_id: currentUser.id,
                user_nickname: currentUser.nickname,
                participating: true,
                confirmed_at: new Date().toISOString()
              }]
            };
          } else {
            return {
              ...v,
              participants: v.participants.map(p =>
                p.user_id === currentUser.id
                  ? { ...p, participating: true, confirmed_at: new Date().toISOString() }
                  : p
              )
            };
          }
        } else {
          if (existingParticipant) {
            return {
              ...v,
              participants: v.participants.map(p =>
                p.user_id === currentUser.id
                  ? { ...p, participating: false, restaurant_id: null }
                  : p
              )
            };
          }
        }
      }
      return v;
    });
    setVotes(updatedVotes);
    storage.setItem('VOTES', updatedVotes);
  };

  const getDepartmentUsers = (departmentId) => {
    return users.filter(u => u.department_id === departmentId);
  };

  const getDepartmentVotes = (departmentId) => {
    return votes.filter(v => v.department_id === departmentId);
  };

  const getDepartmentById = (departmentId) => {
    return departments.find(d => d.id === departmentId);
  };

  const getRestaurantById = (restaurantId) => {
    return restaurants.find(r => r.id === restaurantId);
  };

  const getVoteById = (voteId) => {
    return votes.find(v => v.id === voteId);
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  const addRestaurantRecommendation = (recommendationData) => {
    const isDuplicate = restaurants.some(r => 
      r.name.toLowerCase() === recommendationData.name.toLowerCase()
    );
    
    if (isDuplicate) {
      return { success: false, message: '该餐厅已存在于餐厅池中' };
    }

    const isPendingDuplicate = restaurantRecommendations.some(r => 
      r.name.toLowerCase() === recommendationData.name.toLowerCase() && r.status === 'pending'
    );
    
    if (isPendingDuplicate) {
      return { success: false, message: '该餐厅已有待审核的推荐，请等待管理员审核' };
    }

    const newRecommendation = {
      ...recommendationData,
      id: `rec${Date.now()}`,
      status: 'pending',
      recommended_by: currentUser.id,
      recommended_by_nickname: currentUser.nickname,
      recommended_at: new Date().toISOString()
    };

    const updatedRecommendations = [...restaurantRecommendations, newRecommendation];
    setRestaurantRecommendations(updatedRecommendations);
    storage.setItem('RESTAURANT_RECOMMENDATIONS', updatedRecommendations);
    return { success: true, recommendation: newRecommendation };
  };

  const approveRecommendation = (recommendationId) => {
    const recommendation = restaurantRecommendations.find(r => r.id === recommendationId);
    if (!recommendation || recommendation.status !== 'pending') {
      return { success: false, message: '推荐不存在或状态错误' };
    }

    const newRestaurant = {
      ...recommendation,
      id: `r${Date.now()}`,
      tags: recommendation.tags || []
    };

    const updatedRestaurants = [...restaurants, newRestaurant];
    setRestaurants(updatedRestaurants);
    storage.setItem('RESTAURANTS', updatedRestaurants);

    const updatedRecommendations = restaurantRecommendations.map(r => 
      r.id === recommendationId ? { ...r, status: 'approved' } : r
    );
    setRestaurantRecommendations(updatedRecommendations);
    storage.setItem('RESTAURANT_RECOMMENDATIONS', updatedRecommendations);

    return { success: true };
  };

  const rejectRecommendation = (recommendationId, reason) => {
    const updatedRecommendations = restaurantRecommendations.map(r => 
      r.id === recommendationId 
        ? { ...r, status: 'rejected', reject_reason: reason } 
        : r
    );
    setRestaurantRecommendations(updatedRecommendations);
    storage.setItem('RESTAURANT_RECOMMENDATIONS', updatedRecommendations);
    return { success: true };
  };

  const deleteRecommendation = (recommendationId) => {
    const updatedRecommendations = restaurantRecommendations.filter(r => r.id !== recommendationId);
    setRestaurantRecommendations(updatedRecommendations);
    storage.setItem('RESTAURANT_RECOMMENDATIONS', updatedRecommendations);
    return { success: true };
  };

  const getPendingRecommendations = () => {
    return restaurantRecommendations.filter(r => r.status === 'pending');
  };

  const getUserRecommendations = (userId) => {
    return restaurantRecommendations.filter(r => r.recommended_by === userId);
  };

  const value = {
    users,
    restaurants,
    votes,
    departments,
    restaurantRecommendations,
    currentUser,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    addDepartment,
    deleteDepartment,
    createVote,
    updateVote,
    deleteVote,
    castVote,
    confirmParticipation,
    addRestaurantRecommendation,
    approveRecommendation,
    rejectRecommendation,
    deleteRecommendation,
    getPendingRecommendations,
    getUserRecommendations,
    getDepartmentUsers,
    getDepartmentVotes,
    getDepartmentById,
    getRestaurantById,
    getVoteById,
    getUserById
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

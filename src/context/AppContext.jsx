import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  authAPI, 
  userAPI, 
  restaurantAPI, 
  voteAPI, 
  departmentAPI, 
  recommendationAPI 
} from '../services/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, restaurantsData, votesData, departmentsData, recommendationsData] = await Promise.all([
        userAPI.getAllUsers().catch(() => []),
        restaurantAPI.getAllRestaurants().catch(() => []),
        voteAPI.getAllVotes().catch(() => []),
        departmentAPI.getAllDepartments().catch(() => []),
        recommendationAPI.getAllRecommendations().catch(() => [])
      ]);
      setUsers(usersData);
      setRestaurants(restaurantsData);
      setVotes(votesData);
      setDepartments(departmentsData);
      setRestaurantRecommendations(recommendationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success) {
          setCurrentUser(response.user);
          await loadData();
        }
      } catch {
        setCurrentUser(null);
        setLoading(false);
      }
    };
    checkAuth();
  }, [loadData]);

  const login = async (nickname, password) => {
    try {
      const result = await authAPI.login(nickname, password);
      if (result.success) {
        setCurrentUser(result.user);
        await loadData();
        return { success: true, user: result.user };
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setCurrentUser(null);
      setUsers([]);
      setRestaurants([]);
      setVotes([]);
      setDepartments([]);
      setRestaurantRecommendations([]);
    } catch {
      setCurrentUser(null);
    }
  };

  const addUser = async (user) => {
    try {
      const newUser = await userAPI.createUser(user);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const updatedUser = await userAPI.updateUser(userId, updates);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      throw err;
    }
  };

  const addRestaurant = async (restaurant) => {
    try {
      const newRestaurant = await restaurantAPI.createRestaurant(restaurant);
      setRestaurants(prev => [...prev, newRestaurant]);
      return newRestaurant;
    } catch (err) {
      throw err;
    }
  };

  const updateRestaurant = async (restaurantId, updates) => {
    try {
      const updatedRestaurant = await restaurantAPI.updateRestaurant(restaurantId, updates);
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? updatedRestaurant : r));
      return updatedRestaurant;
    } catch (err) {
      throw err;
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    try {
      await restaurantAPI.deleteRestaurant(restaurantId);
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    } catch (err) {
      throw err;
    }
  };

  const addDepartment = async (department) => {
    try {
      const newDepartment = await departmentAPI.createDepartment(department);
      setDepartments(prev => [...prev, newDepartment]);
      return newDepartment;
    } catch (err) {
      throw err;
    }
  };

  const deleteDepartment = async (departmentId) => {
    try {
      await departmentAPI.deleteDepartment(departmentId);
      setDepartments(prev => prev.filter(d => d.id !== departmentId));
    } catch (err) {
      throw err;
    }
  };

  const createVote = async (voteData) => {
    try {
      const newVote = await voteAPI.createVote(voteData);
      setVotes(prev => [...prev, newVote]);
      return { success: true, vote: newVote };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateVote = async (voteId, updates) => {
    try {
      const updatedVote = await voteAPI.updateVote(voteId, updates);
      setVotes(prev => prev.map(v => v.id === voteId ? updatedVote : v));
      return updatedVote;
    } catch (err) {
      throw err;
    }
  };

  const deleteVote = async (voteId) => {
    try {
      await voteAPI.deleteVote(voteId);
      setVotes(prev => prev.filter(v => v.id !== voteId));
    } catch (err) {
      throw err;
    }
  };

  const castVote = async (voteId, restaurantId) => {
    try {
      await voteAPI.castVote(voteId, restaurantId);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const confirmParticipation = async (voteId, participating) => {
    try {
      await voteAPI.confirmParticipation(voteId, participating);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const addRestaurantRecommendation = async (recommendationData) => {
    try {
      const result = await recommendationAPI.createRecommendation(recommendationData);
      if (result.success) {
        setRestaurantRecommendations(prev => [...prev, { ...result.recommendation, ...recommendationData }]);
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const approveRecommendation = async (recommendationId) => {
    try {
      const result = await recommendationAPI.approveRecommendation(recommendationId);
      if (result.success) {
        setRestaurants(prev => [...prev, result.restaurant]);
        setRestaurantRecommendations(prev => prev.map(r => 
          r.id === recommendationId ? { ...r, status: 'approved' } : r
        ));
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const rejectRecommendation = async (recommendationId, reason) => {
    try {
      const result = await recommendationAPI.rejectRecommendation(recommendationId, reason);
      if (result.success) {
        setRestaurantRecommendations(prev => prev.map(r => 
          r.id === recommendationId ? { ...r, status: 'rejected', reject_reason: reason } : r
        ));
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteRecommendation = async (recommendationId) => {
    try {
      await recommendationAPI.deleteRecommendation(recommendationId);
      setRestaurantRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    } catch (err) {
      throw err;
    }
  };

  const getPendingRecommendations = () => {
    return restaurantRecommendations.filter(r => r.status === 'pending');
  };

  const getUserRecommendations = (userId) => {
    return restaurantRecommendations.filter(r => r.recommended_by === userId);
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

  const refreshData = () => {
    loadData();
  };

  const value = {
    users,
    restaurants,
    votes,
    departments,
    restaurantRecommendations,
    currentUser,
    loading,
    error,
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
    getUserById,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 
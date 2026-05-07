const API_BASE_URL = 'http://localhost:3001/api';

const getToken = () => {
  return localStorage.getItem('dinner_voting_token');
};

const setToken = (token) => {
  localStorage.setItem('dinner_voting_token', token);
};

const removeToken = () => {
  localStorage.removeItem('dinner_voting_token');
};

const request = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
};

export const authAPI = {
  login: async (nickname, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nickname, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (nickname, password, role = 'member', department_id = null) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nickname, password, role, department_id }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: async () => {
    await request('/auth/logout', { method: 'POST' });
    removeToken();
  },

  getCurrentUser: async () => {
    const data = await request('/auth/me');
    return data;
  },
};

export const userAPI = {
  getAllUsers: async () => {
    const data = await request('/users');
    return data.users;
  },

  getUserById: async (id) => {
    const data = await request(`/users/${id}`);
    return data.user;
  },

  createUser: async (user) => {
    const data = await request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return data.user;
  },

  updateUser: async (id, updates) => {
    const data = await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  deleteUser: async (id) => {
    const data = await request(`/users/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

export const restaurantAPI = {
  getAllRestaurants: async () => {
    const data = await request('/restaurants');
    return data.restaurants;
  },

  getRestaurantById: async (id) => {
    const data = await request(`/restaurants/${id}`);
    return data.restaurant;
  },

  createRestaurant: async (restaurant) => {
    const data = await request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurant),
    });
    return data.restaurant;
  },

  updateRestaurant: async (id, updates) => {
    const data = await request(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.restaurant;
  },

  deleteRestaurant: async (id) => {
    const data = await request(`/restaurants/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

export const voteAPI = {
  getAllVotes: async () => {
    const data = await request('/votes');
    return data.votes;
  },

  getVoteById: async (id) => {
    const data = await request(`/votes/${id}`);
    return data.vote;
  },

  createVote: async (voteData) => {
    const data = await request('/votes', {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
    return data.vote;
  },

  updateVote: async (id, updates) => {
    const data = await request(`/votes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.vote;
  },

  deleteVote: async (id) => {
    const data = await request(`/votes/${id}`, {
      method: 'DELETE',
    });
    return data;
  },

  castVote: async (voteId, restaurantId) => {
    const data = await request(`/votes/${voteId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ restaurant_id: restaurantId }),
    });
    return data;
  },

  confirmParticipation: async (voteId, participating) => {
    const data = await request(`/votes/${voteId}/participate`, {
      method: 'POST',
      body: JSON.stringify({ participating }),
    });
    return data;
  },
};

export const departmentAPI = {
  getAllDepartments: async () => {
    const data = await request('/departments');
    return data.departments;
  },

  getDepartmentById: async (id) => {
    const data = await request(`/departments/${id}`);
    return data.department;
  },

  createDepartment: async (department) => {
    const data = await request('/departments', {
      method: 'POST',
      body: JSON.stringify(department),
    });
    return data.department;
  },

  updateDepartment: async (id, updates) => {
    const data = await request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.department;
  },

  deleteDepartment: async (id) => {
    const data = await request(`/departments/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

export const recommendationAPI = {
  getAllRecommendations: async () => {
    const data = await request('/recommendations');
    return data.recommendations;
  },

  getPendingRecommendations: async () => {
    const data = await request('/recommendations/pending');
    return data.recommendations;
  },

  getUserRecommendations: async () => {
    const data = await request('/recommendations/my');
    return data.recommendations;
  },

  createRecommendation: async (recommendation) => {
    const data = await request('/recommendations', {
      method: 'POST',
      body: JSON.stringify(recommendation),
    });
    return data;
  },

  approveRecommendation: async (id) => {
    const data = await request(`/recommendations/${id}/approve`, {
      method: 'POST',
    });
    return data;
  },

  rejectRecommendation: async (id, reason) => {
    const data = await request(`/recommendations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return data;
  },

  deleteRecommendation: async (id) => {
    const data = await request(`/recommendations/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

export { getToken, setToken, removeToken };
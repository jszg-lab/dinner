const STORAGE_KEYS = {
  USERS: 'dinner_voting_users',
  RESTAURANTS: 'dinner_voting_restaurants',
  VOTES: 'dinner_voting_votes',
  DEPARTMENTS: 'dinner_voting_departments',
  SETTLEMENTS: 'dinner_voting_settlements',
  ARCHIVES: 'dinner_voting_archives',
  CURRENT_USER: 'dinner_voting_current_user'
};

export const storage = {
  getItem: (key) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(STORAGE_KEYS[key]);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  }
};

export default STORAGE_KEYS;

const STORAGE_KEYS = {
  USERS: 'dinner_party_users',
  CURRENT_USER: 'dinner_party_current_user',
  RESTAURANTS: 'dinner_party_restaurants',
  VOTES: 'dinner_party_votes',
  VOTE_RECORDS: 'dinner_party_vote_records',
  SETTLEMENTS: 'dinner_party_settlements',
  DEPARTMENTS: 'dinner_party_departments',
  ARCHIVES: 'dinner_party_archives',
  DRAW_RESULTS: 'dinner_party_draw_results',
};

export function getItem(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

export function clearAll() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export { STORAGE_KEYS };

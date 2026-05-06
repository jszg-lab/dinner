import React, { createContext, useContext, useState, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService.js';
import { voteService } from '../services/voteService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [votes, setVotes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshRestaurants = useCallback(() => {
    const data = restaurantService.getAllRestaurants();
    setRestaurants(data);
  }, []);

  const refreshVotes = useCallback(() => {
    const data = voteService.getAllVotes();
    setVotes(data);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const value = {
    restaurants,
    votes,
    refreshKey,
    refreshRestaurants,
    refreshVotes,
    triggerRefresh,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;

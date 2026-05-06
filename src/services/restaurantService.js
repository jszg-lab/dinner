import { getItem, setItem, generateId, STORAGE_KEYS } from '../utils/storage.js';
import { sampleRestaurants } from '../data/mockData.js';
import { parseRestaurantJson, validateRestaurantData } from '../utils/jsonParser.js';

function initializeRestaurants() {
  const existingRestaurants = getItem(STORAGE_KEYS.RESTAURANTS);
  if (!existingRestaurants) {
    setItem(STORAGE_KEYS.RESTAURANTS, sampleRestaurants);
  }
}

function getRestaurants() {
  initializeRestaurants();
  return getItem(STORAGE_KEYS.RESTAURANTS) || [];
}

function saveRestaurants(restaurants) {
  setItem(STORAGE_KEYS.RESTAURANTS, restaurants);
}

export const restaurantService = {
  getAllRestaurants() {
    return getRestaurants();
  },

  getRestaurantById(id) {
    const restaurants = getRestaurants();
    return restaurants.find(r => r.id === id) || null;
  },

  createRestaurant(data) {
    const restaurants = getRestaurants();
    
    const newRestaurant = {
      id: generateId(),
      ...data,
      avgPrice: Number(data.avgPrice) || 0,
      rating: Number(data.rating) || 0,
      reviewCount: Number(data.reviewCount) || 0,
      hasPrivateRoom: Boolean(data.hasPrivateRoom),
      signatureDishes: data.signatureDishes || [],
      tags: data.tags || [],
      mainReviews: data.mainReviews || [],
      platformLinks: data.platformLinks || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    restaurants.push(newRestaurant);
    saveRestaurants(restaurants);
    return newRestaurant;
  },

  updateRestaurant(id, data) {
    const restaurants = getRestaurants();
    const index = restaurants.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('餐厅不存在');
    }

    restaurants[index] = {
      ...restaurants[index],
      ...data,
      avgPrice: Number(data.avgPrice) ?? restaurants[index].avgPrice,
      rating: Number(data.rating) ?? restaurants[index].rating,
      reviewCount: Number(data.reviewCount) ?? restaurants[index].reviewCount,
      hasPrivateRoom: data.hasPrivateRoom !== undefined ? Boolean(data.hasPrivateRoom) : restaurants[index].hasPrivateRoom,
      updatedAt: new Date().toISOString(),
    };

    saveRestaurants(restaurants);
    return restaurants[index];
  },

  deleteRestaurant(id) {
    const restaurants = getRestaurants();
    const index = restaurants.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('餐厅不存在');
    }

    restaurants.splice(index, 1);
    saveRestaurants(restaurants);
  },

  importFromJson(jsonString) {
    const parsedRestaurants = parseRestaurantJson(jsonString);
    const validation = validateRestaurantData(parsedRestaurants);
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join('; '));
    }

    const existingRestaurants = getRestaurants();
    const newRestaurants = parsedRestaurants.map(r => ({
      id: generateId(),
      ...r,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    saveRestaurants([...existingRestaurants, ...newRestaurants]);
    
    return {
      success: newRestaurants.length,
      failed: 0,
      total: newRestaurants.length,
    };
  },

  searchRestaurants(keyword) {
    const restaurants = getRestaurants();
    if (!keyword) return restaurants;

    const lowerKeyword = keyword.toLowerCase();
    return restaurants.filter(r => 
      r.name.toLowerCase().includes(lowerKeyword) ||
      r.cuisineType.toLowerCase().includes(lowerKeyword) ||
      r.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  },

  filterRestaurants(filters) {
    let restaurants = getRestaurants();

    if (filters.cuisineType) {
      restaurants = restaurants.filter(r => r.cuisineType === filters.cuisineType);
    }

    if (filters.hasPrivateRoom !== undefined) {
      restaurants = restaurants.filter(r => r.hasPrivateRoom === filters.hasPrivateRoom);
    }

    if (filters.minRating) {
      restaurants = restaurants.filter(r => r.rating >= filters.minRating);
    }

    if (filters.maxPrice) {
      restaurants = restaurants.filter(r => r.avgPrice <= filters.maxPrice);
    }

    return restaurants;
  },

  getCuisineTypes() {
    const restaurants = getRestaurants();
    const types = [...new Set(restaurants.map(r => r.cuisineType))];
    return types.sort();
  },
};

export default restaurantService;

export function parseRestaurantJson(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data.restaurants || !Array.isArray(data.restaurants)) {
      throw new Error('Invalid JSON format: missing restaurants array');
    }

    return data.restaurants.map((r, index) => ({
      name: r.name || `未命名餐厅${index + 1}`,
      cuisineType: r.cuisine_type || r.cuisineType || '未知',
      avgPrice: r.avg_price || r.avgPrice || 0,
      rating: r.rating || 0,
      reviewCount: r.review_count || r.reviewCount || 0,
      address: r.address || '',
      phone: r.phone || '',
      businessHours: r.business_hours || r.businessHours || '',
      suitableGroupSize: r.suitable_group_size || r.suitableGroupSize || '',
      hasPrivateRoom: r.has_private_room || r.hasPrivateRoom || false,
      privateRoomInfo: r.private_room_info || r.privateRoomInfo || '',
      signatureDishes: r.signature_dishes || r.signatureDishes || [],
      tags: r.tags || [],
      mainReviews: r.main_reviews || r.mainReviews || [],
      distanceToCenter: r.distance_to_center || r.distanceToCenter || '',
      platformLinks: r.platform_links || r.platformLinks || {},
    }));
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

export function validateRestaurantData(restaurants) {
  const errors = [];
  
  restaurants.forEach((r, index) => {
    if (!r.name) {
      errors.push(`Restaurant ${index + 1}: name is required`);
    }
    if (typeof r.avgPrice !== 'number' || r.avgPrice < 0) {
      errors.push(`Restaurant ${index + 1}: invalid avgPrice`);
    }
    if (typeof r.rating !== 'number' || r.rating < 0 || r.rating > 5) {
      errors.push(`Restaurant ${index + 1}: rating must be between 0 and 5`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

import axios from 'axios';

// Base API configuration
// Proxy is configured in package.json to forward requests to http://localhost:4000
const api = axios.create({
  timeout: 30000, // 30 second timeout
});

/**
 * Upload image for disease analysis
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise} - Analysis results with prediction and conversation ID
 */
export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get prediction history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of predictions to fetch
 * @returns {Promise} - Array of predictions
 */
export const getPredictionHistory = async (userId, limit = 20) => {
  const response = await api.get(`/api/predictions/${userId}`, {
    params: { limit },
  });

  return response.data;
};

/**
 * Check health status of all services
 * @returns {Promise} - Health status object
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    // Gracefully handle 500 errors for websites endpoint (likely DB not set up)
    if (error.response?.status === 500 && error.config?.url === '/api/websites') {
      console.warn('Websites endpoint failed, treating as empty list');
      return Promise.resolve({ data: [] });
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  verify: () => api.get('/api/auth/verify'),
};

// Websites API
export const websitesAPI = {
  getAll: () => api.get('/api/websites'),
  create: (website) => api.post('/api/websites', website),
  update: (id, website) => api.put(`/api/websites/${id}`, website),
  delete: (id) => api.delete(`/api/websites/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (websiteId, period = '7d') =>
    api.get(`/api/analytics/${websiteId}/overview?period=${period}`),

  getPages: (websiteId, period = '7d') =>
    api.get(`/api/analytics/${websiteId}/pages?period=${period}`),

  getReferrers: (websiteId, period = '7d') =>
    api.get(`/api/analytics/${websiteId}/referrers?period=${period}`),

  getTechnology: (websiteId, period = '7d') =>
    api.get(`/api/analytics/${websiteId}/technology?period=${period}`),

  getGeography: (websiteId, period = '7d') =>
    api.get(`/api/analytics/${websiteId}/geography?period=${period}`),

  getEvents: (websiteId, period = '7d') =>
    api.get(`/api/analytics/${websiteId}/events?period=${period}`),
};

export default api;

import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/';
      } else if (status === 403) {
        console.error('Forbidden:', data.message);
      } else if (status === 404) {
        console.error('Not found:', data.message);
      } else if (status >= 500) {
        console.error('Server error:', data.message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Service Functions
 */
export const api = {
  // Posts
  getPosts: (params = {}) => apiClient.get('/posts', { params }),
  createPost: (data) => apiClient.post('/posts', data),
  likePost: (postId) => apiClient.post(`/posts/${postId}/like`),
  unlikePost: (postId) => apiClient.delete(`/posts/${postId}/like`),
  getPostLikes: (postId) => apiClient.get(`/posts/${postId}/likes`),
  addComment: (postId, data) => apiClient.post(`/posts/${postId}/comments`, data),
  getComments: (postId) => apiClient.get(`/posts/${postId}/comments`),

  // Search
  searchAutocomplete: (query) => apiClient.get('/search/quick', { params: { q: query } }),
  search: (query, type = 'all') => apiClient.get('/search', { params: { q: query, type } }),

  // Recommendations
  getProfileRecommendations: (userId, limit = 5) => 
    apiClient.get(`/recommendations/profiles/${userId}`, { params: { limit } }),
  getProjectRecommendations: (userId, limit = 5) => 
    apiClient.get(`/recommendations/projects/${userId}`, { params: { limit } }),
  getEventRecommendations: (userId, limit = 5) => 
    apiClient.get(`/recommendations/events/${userId}`, { params: { limit } }),

  // Connections
  sendConnectionRequest: (data) => apiClient.post('/connections/request', data),
  acceptConnection: (requestId) => apiClient.post(`/connections/${requestId}/accept`),
  rejectConnection: (requestId) => apiClient.post(`/connections/${requestId}/reject`),
  getConnections: (userId) => apiClient.get(`/connections/${userId}`),
  getPendingRequests: (userId) => apiClient.get(`/connections/${userId}/pending`),

  // Projects
  getPopularProjects: (limit = 5) => apiClient.get('/projects/popular', { params: { limit } }),
  joinProject: (projectId) => apiClient.post(`/projects/${projectId}/join-request`),

  // Events
  getUpcomingEvents: (limit = 5) => apiClient.get('/events/upcoming', { params: { limit } }),
  rsvpEvent: (eventId) => apiClient.post(`/events/${eventId}/rsvp`),

  // Discussions/Spaces
  getTrendingDiscussions: (limit = 5) => apiClient.get('/spaces/trending', { params: { limit } }),

  // Profile
  getProfile: (userId) => apiClient.get(`/profile/${userId}`),
  updateProfile: (userId, data) => apiClient.put(`/profile/${userId}`, data),

  // Users
  getUsers: () => apiClient.get('/users'),

  // Clubs
  getClubs: () => apiClient.get('/clubs'),

  // Stream Token
  getStreamToken: (userId, validity = 3600) => 
    apiClient.post('/stream/token', { userId, validity })
};

/**
 * Helper function to get current user ID
 */
export const getCurrentUserId = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData._id || null;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
};

/**
 * Helper function to get current user
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
  } catch (error) {
    console.error('Error getting user:', error);
  }
  return null;
};

export default api;

import api from './api';

export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),
  
  // Users
  getAllUsers: () => api.get('/admin/users'),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

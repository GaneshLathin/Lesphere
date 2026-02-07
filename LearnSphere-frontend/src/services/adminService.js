import api from './api';

export const adminService = {
    // User Management
    getAllUsers: () => api.get('/admin/users'),
    blockUser: (userId, data) => api.post(`/admin/users/${userId}/block`, data),
    deleteUser: (userId, reason) => api.delete(`/admin/users/${userId}`, { params: { reason } }),

    // Dashboard Stats
    getStats: () => api.get('/admin/stats'),
};

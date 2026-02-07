import api from './api';

export const profileService = {
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    uploadProfileImage: (formData) => api.post('/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProfileImage: () => api.delete('/profile/image'),
    uploadBannerImage: (formData) => api.post('/profile/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteBannerImage: () => api.delete('/profile/banner'),

    // Activity
    getUserActivity: (year) => api.get(`/profile/activity?year=${year}`),
    logActivity: () => api.post('/profile/activity/log'),
};

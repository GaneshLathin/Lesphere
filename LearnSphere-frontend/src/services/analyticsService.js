// src/services/analyticsService.js
import api from './api';

const getStudentAnalytics = async () => {
    const response = await api.get('/analytics/student');
    return response.data;
};

const getInstructorAnalytics = async () => {
    const response = await api.get('/analytics/instructor');
    return response.data;
};

const getAdminAnalytics = async () => {
    const response = await api.get('/analytics/admin');
    return response.data;
};

const getInstructorStudentProgress = async () => {
    const response = await api.get('/analytics/instructor/progress');
    return response.data;
};

export default {
    getStudentAnalytics,
    getInstructorAnalytics,
    getAdminAnalytics,
    getInstructorStudentProgress
};

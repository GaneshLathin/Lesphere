import api from './api'

export const dashboardService = {
  async getStudentStats(studentId) {
    const response = await api.get(`/students/${studentId}/stats`)
    return response.data
  },

  async getInstructorStats(instructorId) {
    const response = await api.get(`/instructors/${instructorId}/stats`)
    return response.data
  },

  async getAdminStats() {
    const response = await api.get('/admin/stats')
    return response.data
  },

  // Comprehensive dashboard statistics
  async getOverallStatistics(studentId) {
    const response = await api.get(`/dashboard/student/${studentId}/overall-statistics`)
    return response
  },

  async getMyOverallStatistics() {
    const response = await api.get('/dashboard/my-overall-statistics')
    return response
  }
}
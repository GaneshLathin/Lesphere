import api from './api'

/**
 * Service for quiz statistics and tracking
 */
export const quizStatisticsService = {
  /**
   * Get quiz statistics for a course
   */
  async getCourseQuizStatistics(studentId, courseId) {
    const response = await api.get(`/quiz-statistics/student/${studentId}/course/${courseId}`)
    return response.data
  },

  /**
   * Get overall quiz statistics for a student
   */
  async getOverallQuizStatistics(studentId) {
    const response = await api.get(`/quiz-statistics/student/${studentId}`)
    return response.data
  },

  /**
   * Get comprehensive quiz tracking (stats + history)
   */
  async getQuizTracking(studentId, courseId) {
    const response = await api.get(`/quiz-statistics/student/${studentId}/course/${courseId}/tracking`)
    return response.data
  },

  /**
   * Get my quiz statistics for a course
   */
  async getMyQuizStatistics(studentId, courseId) {
    const response = await api.get(`/quiz-statistics/course/${courseId}/my-stats`, {
      params: { studentId }
    })
    return response.data
  },

  /**
   * Get my overall quiz statistics
   */
  async getMyOverallStatistics(studentId) {
    const response = await api.get('/quiz-statistics/my-overall-stats', {
      params: { studentId }
    })
    return response.data
  }
}

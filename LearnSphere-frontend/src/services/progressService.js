import api from './api'


export const progressService = {
  async getProgress(studentId, courseId) {
    const response = await api.get(`/progress/student/${studentId}/course/${courseId}`)
    return response.data
  },


  async recommendNextTopic(studentId, courseId) {
    const response = await api.get(`/progress/recommend/${studentId}/${courseId}`)
    return response.data
  },


  getStudentProgress(studentId) {
    return api.get(`/progress/student/${studentId}`)
  },

  getTopicProgress(studentId) {
    return api.get(`/progress/student/${studentId}/topics`)
  },

  /** Get progress of a single course */
  getCourseProgress(studentId, courseId) {
    return api.get(`/progress/student/${studentId}/course/${courseId}`)
  },

  /** Update progress (if needed later for adaptive) */
  updateProgress(payload) {
    return api.post('/progress/update', payload)
  },

  markTopicComplete(studentId, topicId) {
    return api.post("/progress/topic/complete", { studentId, topicId });
  }

}

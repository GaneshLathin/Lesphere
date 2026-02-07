import api from './api'

export const materialProgressService = {
  async markMaterialCompleted(studentId, materialId) {
    const response = await api.post('/progress/material/complete', { studentId, materialId })
    return response.data
  },

  async getTopicProgress(studentId, topicId) {
    const response = await api.get(`/progress/student/${studentId}/topic/${topicId}`)
    return response.data
  },
  // NEW: addTime for topic (seconds)
  // Backend endpoint expected: POST /api/progress/topic/add-time
  // body: { studentId, topicId, seconds }
  async addTime(studentId, topicId, seconds) {
    const response = await api.post('/progress/topic/add-time', { studentId, topicId, seconds })
    return response.data
  }
}

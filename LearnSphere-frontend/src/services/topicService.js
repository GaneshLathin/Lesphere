import api from './api'

export const topicService = {
  async createTopic(topicData) {
    const response = await api.post('/topics', topicData)
    return response.data
  },

  async getTopicsByCourse(courseId) {
    const response = await api.get(`/topics/course/${courseId}`)
    return response.data
  },

  async getTopicById(topicId) {
    const response = await api.get(`/topics/${topicId}`)
    return response.data
  },

  async updateTopic(topicId, topicData) {
    const response = await api.put(`/topics/${topicId}`, topicData)
    return response.data
  },

  async deleteTopic(topicId) {
    const response = await api.delete(`/topics/${topicId}`)
    return response.data
  }
}

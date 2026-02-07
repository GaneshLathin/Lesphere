import api from './api'

export const adaptiveService = {
  getNextTopic(studentId, courseId) {
    return api.get('/adaptive/next-topic', {
      params: { studentId, courseId }
    })
  }
}

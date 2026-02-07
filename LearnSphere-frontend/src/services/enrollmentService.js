import api from './api'

export const enrollmentService = {
  async enrollCourse(studentId, courseId) {
    const response = await api.post(`/enrollments?studentId=${studentId}&courseId=${courseId}`)
    return response.data
  },

  async getStudentEnrollments(studentId) {
    const response = await api.get(`/enrollments/student/${studentId}`)
    return response.data
  },

  async unenrollCourse(studentId, courseId) {
    const response = await api.delete(`/enrollments?studentId=${studentId}&courseId=${courseId}`)
    return response.data
  }
}
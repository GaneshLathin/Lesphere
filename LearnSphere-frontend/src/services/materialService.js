import api from './api'

export const materialService = {
  async uploadMaterial(formData) {
    try {
      const response = await api.post('/materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 600000, // 10 minutes timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload Progress: ${percentCompleted}%`)
        }
      })
      return response.data
    } catch (error) {
      if (error.response?.status === 413) {
        throw new Error('File too large. Please reduce the file size.')
      }
      if (error.response?.status === 408) {
        throw new Error('Upload timeout. Please check your internet connection and try again.')
      }
      throw error
    }
  },

  async createLinkMaterial(materialData) {
    // Convert to URL-encoded format for link materials
    const formData = new URLSearchParams()
    formData.append('topicId', materialData.topicId)
    formData.append('title', materialData.title)
    formData.append('description', materialData.description || '')
    formData.append('link', materialData.link)

    const response = await api.post('/materials/link', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  },

  async getMaterialsByTopic(topicId) {
    const response = await api.get(`/materials/topic/${topicId}`)
    return response.data
  },

  async deleteMaterial(materialId) {
    const response = await api.delete(`/materials/${materialId}`)
    return response.data
  },

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
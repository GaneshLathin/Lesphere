import api from './api'

export const quizService = {
  async generateAIQuiz(request) {
    const response = await api.post('/quizzes/generate', request)
    return response.data.data // Extract the actual AIQuizResponse from ApiResponse wrapper
  },

  // async saveAIQuiz(params, quizData) {
  //   const url = `/quizzes/save-from-ai?instructorId=${params.instructorId}&courseId=${params.courseId}&topicId=${params.topicId}&title=${encodeURIComponent(params.title)}`
  //   const response = await api.post(url, quizData)
  //   return response.data
  // },
  async saveAIQuiz(params, quizData) {
  const url =
    `/quizzes/save-from-ai?` +
    `instructorId=${params.instructorId}` +
    `&courseId=${params.courseId}` +
    `&topicId=${params.topicId}` +
    `&duration=${params.duration}` + // ✅ FIX
    `&title=${encodeURIComponent(params.title)}`;

  return api.post(url, quizData).then(res => res.data.data);
},

  async saveManualQuiz(payload) {
    const res = await api.post('/quizzes/manual', payload);
    return res.data;
  },

  async createQuiz(quizData) {
    const response = await api.post('/quizzes', quizData)
    return response.data
  },

  async getQuizByTopic(topicId) {
    const response = await api.get(`/quizzes/topic/${topicId}`)
    return response.data
  },

 
  async getQuizByTopic(topicId) {
    const response = await api.get(`/quizzes/topic/${topicId}`);
    return response.data;
  },
  async getQuestionsByQuiz(quizId) {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data.data;
  },

  async submitAttempt(quizId, payload) {
    const response = await api.post(`/quizzes/${quizId}/attempt`, payload)
    return response.data
  },
  async getQuizById(quizId) {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data.data;
  }

}

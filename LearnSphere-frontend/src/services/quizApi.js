// src/services/quizApi.js
import api from "../services/api"; // 🔥 use global axios with token

// Get quiz by topic
export const getQuizByTopic = async (topicId) => {
  const res = await api.get(`/quizzes/topic/${topicId}`);
  return res.data.data;
};

// Get questions for quiz
export const getQuestionsByQuiz = async (quizId) => {
  const res = await api.get(`/questions/quiz/${quizId}`);
  return res.data.data;
};

export default {
  getQuizByTopic,
  getQuestionsByQuiz,
};

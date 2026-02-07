// src/services/aiApi.js
import api from "../services/api"
 // <-- your global axios with token & interceptors

// Generate AI Quiz
export const generateAIQuiz = async (body) => {
  const res = await api.post("/quizzes/generate", body);
  return res.data.data;
};


export const saveAIQuiz = async (params, quizData) => {
  const url =
    `/quizzes/save-from-ai?` +
    `instructorId=${params.instructorId}` +
    `&courseId=${params.courseId}` +
    `&topicId=${params.topicId}` +
    `&duration=${params.duration}` + // 🔥 ADD
    `&title=${encodeURIComponent(params.title)}`;

  const res = await api.post(url, quizData);
  return res.data.data;
};

export default { generateAIQuiz, saveAIQuiz };

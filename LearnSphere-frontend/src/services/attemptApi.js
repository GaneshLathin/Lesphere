// src/services/attemptApi.js
import api from "../services/api"; // 🔥 your global axios (includes token automatically)

// Submit quiz attempt
export const submitAttempt = async (quizId, body) => {
  const res = await api.post(`/quizzes/${quizId}/attempt`, body);
  return res.data.data;
};



export const getAttempts = async (quizId, studentId) => {
  const res = await api.get(`/quizzes/${quizId}/attempts/${studentId}`);
  console.log("[attemptApi] getAttempts raw response:", res);
  // Ensure we handle cases where data might be nested or direct
  return res.data?.data ?? res.data;
};

export default { submitAttempt, getAttempts };

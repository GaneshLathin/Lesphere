// src/components/Quiz/QuizByTopic.jsx
import { useState } from "react";
import { getQuizByTopic } from "../../services/quizApi";
import QuizPlayer from "./QuizPlayer";

export default function QuizByTopic() {
  const [topicId, setTopicId] = useState("");
  const [quiz, setQuiz] = useState(null);

  const loadQuiz = async () => {
    const data = await getQuizByTopic(topicId);
    if (!data) return alert("No quiz found!");
    setQuiz(data);
  };

  return (
    <div className="p-6 bg-white rounded shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Load Quiz by Topic</h2>

      <input
        className="w-full p-2 border rounded mb-3"
        placeholder="Enter Topic ID"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
      />

      <button
        onClick={loadQuiz}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Load Quiz
      </button>

      {quiz && (
        <QuizPlayer quizId={quiz.id} topicId={topicId} />
      )}
    </div>
  );
}

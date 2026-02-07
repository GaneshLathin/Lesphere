// src/pages/QuizPage.jsx
import AIQuizGenerator from "../components/Quiz/AIQuizGenerator";
import QuizByTopic from "../components/Quiz/QuizByTopic";

export default function QuizPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <AIQuizGenerator />
      <QuizByTopic />
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { getQuestionsByQuiz } from "../../services/quizApi";
import { submitAttempt } from "../../services/attemptApi";
import QuizResult from "./QuizResult";
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";

export default function QuizPlayer({ quizId, topicId }) {
  const { user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);

  // Ref to access latest answers inside event listeners
  const answersRef = useRef(answers);
  const submittedRef = useRef(submitted);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  useEffect(() => {
    load();

    // Security & Anti-Cheating Document Listeners
    const handleVisibilityChange = () => {
      console.log("Visibility changed. Hidden:", document.hidden);
      if (document.hidden && !submittedRef.current) {
        toast.error("Tab switch detected! Quiz Auto-Submitted.", { duration: 4000, icon: '🚨' });
        handleSubmit();
      }
    };

    const preventActions = (e) => {
      console.log("Action prevented:", e.type);
      e.preventDefault();
      toast.error("Action not allowed during quiz!", { id: 'security-warning' });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", preventActions);
    document.addEventListener("copy", preventActions);
    document.addEventListener("cut", preventActions);
    document.addEventListener("paste", preventActions);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventActions);
      document.removeEventListener("copy", preventActions);
      document.removeEventListener("cut", preventActions);
      document.removeEventListener("paste", preventActions);
    };
  }, []);

  const load = async () => {
    const data = await getQuestionsByQuiz(quizId);
    setQuestions(data);
  };

  const handleSubmit = async () => {
    if (submittedRef.current) return; // Prevent double submit

    if (!user?.studentId) {
      console.error("Student ID missing");
      return;
    }

    // Use current answers from Ref to ensure we have latest state even if called from event listener
    const currentAnswers = answersRef.current;

    const formatted = Object.entries(currentAnswers).map(([qid, ans]) => ({
      questionId: qid,
      answerText: ans,
    }));

    const body = {
      studentId: user.studentId,
      topicId: topicId,
      timeSpent: 30, // TODO: Implement real timer
      answers: formatted,
    };

    try {
      const result = await submitAttempt(quizId, body);
      setSubmitted(result);
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit quiz");
    }
  };

  if (submitted) {
    return <QuizResult result={submitted} />;
  }

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50 select-none shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Quiz Started</h3>
        <span className="text-xs text-red-500 font-semibold uppercase tracking-wider border border-red-200 bg-red-50 px-2 py-1 rounded">
          Anti-Cheat Enabled
        </span>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6 text-sm text-yellow-800">
        <p>⚠️ <strong>Warning:</strong> Do not switch tabs or try to copy text. The quiz will <strong>auto-submit</strong> immediately if you switch tabs.</p>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="mb-6 bg-white p-4 rounded shadow-sm border border-gray-100">
          <p className="font-semibold text-gray-800 mb-3">
            {idx + 1}. {q.questionText}
          </p>

          <div className="space-y-2">
            {q.answers.map((op) => (
              <label key={op.id} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={op.optionText}
                  checked={answers[q.id] === op.optionText}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: op.optionText }))
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700">{op.optionText}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded shadow transition-colors w-full md:w-auto"
      >
        Submit Quiz
      </button>
    </div>
  );
}

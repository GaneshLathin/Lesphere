// src/components/quiz/AIQuizGenerator.jsx
import { useState } from "react";
import { quizService } from "../../services/quizService";
import toast from "react-hot-toast";

export default function AIQuizGenerator({ courseId, topicId, instructorId }) {
  const [topicName, setTopicName] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [duration, setDuration] = useState(10); // minutes (default)

  // -----------------------------
  // GENERATE AI QUIZ
  // -----------------------------
  const handleGenerate = async () => {
    if (!topicName.trim()) {
      toast.error("Please enter a topic name");
      return;
    }

    try {
      setLoading(true);
      const body = {
        topicName,
        difficulty,
        numberOfQuestions: parseInt(numberOfQuestions) || 5
      };
      const data = await quizService.generateAIQuiz(body);
      setGeneratedQuiz(data);
      toast.success("Quiz generated successfully!");
    } catch (err) {
      console.error("Generate error:", err);
      toast.error(err.response?.data?.message || "Failed to generate AI quiz");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // SAVE AI QUIZ (USES REAL IDS)
  // -----------------------------

  const handleSave = async () => {
    if (!generatedQuiz) {
      toast.error("No quiz to save");
      return;
    }

    try {
      setLoading(true);

      const params = {
        instructorId,
        courseId,
        topicId,
        title: `${topicName} - AI Quiz`,
        duration // 🔥 ADD THIS
      };

      const saved = await quizService.saveAIQuiz(params, generatedQuiz);

      toast.success("AI Quiz saved successfully!");

      // Reset form
      setTopicName("");
      setDifficulty("BEGINNER");
      setNumberOfQuestions(5);
      setDuration(10);
      setGeneratedQuiz(null);

    } catch (err) {
      console.error("Save error:", err);
      if (err.response?.data?.message?.includes("Quota exceeded")) {
        toast.error("AI quota exceeded. Please wait a few seconds and try again.");
      } else {
        toast.error(err.response?.data?.message || "Failed to save quiz!");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">AI Quiz Generator</h2>

      {/* Topic Name */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Topic Name *</label>
        <input
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Variables and Data Types"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
        <select
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Number of Questions */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Number of Questions</label>
        <input
          type="number"
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
          max="20"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(e.target.value)}
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">
          Quiz Duration (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="180"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="Enter quiz duration"
        />
      </div>


      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
      >
        {loading ? "Generating..." : "Generate Quiz with AI"}
      </button>

      {/* Generated Quiz Preview */}
      {generatedQuiz && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Generated Questions Preview:</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {generatedQuiz.questions?.map((q, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                <p className="font-medium text-gray-900">Q{idx + 1}. {q.questionText}</p>
                <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                  {q.options?.map((opt, oIdx) => (
                    <li key={oIdx} className={q.correctAnswer === opt ? "font-semibold text-green-600" : ""}>
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? "Saving..." : "Save AI Quiz to Course"}
          </button>
        </div>
      )}
    </div>
  );
}

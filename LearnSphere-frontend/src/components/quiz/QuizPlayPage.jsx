import React, { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { quizService } from "../../services/quizService"
import { submitAttempt } from "../../services/attemptApi"
import { progressService } from "../../services/progressService"
import Card from "../common/Card"
import Button from "../common/Button"
import Loader from "../common/Loader"
import toast from "react-hot-toast"
import QuizResult from "./QuizResult"
import { ArrowLeft } from "lucide-react"

export default function QuizPlayPage() {
  const { quizId, id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const resolvedQuizId = quizId || id || state?.quizId
  const readOnly = state?.readOnly || user?.role === "INSTRUCTOR"

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [quizMeta, setQuizMeta] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submittedResult, setSubmittedResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Timer
  const [startTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState(null)
  const [timerReady, setTimerReady] = useState(false)
  const [showTimeUp, setShowTimeUp] = useState(false)

  // Pagination
  const QUESTIONS_PER_PAGE = 1
  const [page, setPage] = useState(0)

  useEffect(() => {
    loadQuiz()
    // eslint-disable-next-line
  }, [resolvedQuizId])

  // Refs for Event Listeners
  const submittedRef = React.useRef(submittedResult)
  const submittingRef = React.useRef(submitting)

  useEffect(() => {
    submittedRef.current = submittedResult
  }, [submittedResult])

  useEffect(() => {
    submittingRef.current = submitting
  }, [submitting])

  // ---------------- SECURITY ----------------
  useEffect(() => {
    if (readOnly) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current && !submittingRef.current) {
        toast.error("Tab switch detected! Quiz Auto-Submitted.", {
          icon: '🚨',
          duration: 5000
        });
        handleSubmit(true);
      }
    };

    const handleKeyUp = (e) => {
      // 2. Screenshot Keys (PrintScreen)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        if (!submittedRef.current && !submittingRef.current) {
          toast.dismiss();
          toast.error("Screenshot attempt detected! Quiz Auto-Submitted.", { icon: '📸', duration: 5000 });
          handleSubmit(true);
        }
      }
    };

    const preventActions = (e) => {
      e.preventDefault();
      toast.error("Action not allowed during quiz!", { id: 'security-warning' });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("contextmenu", preventActions);
    document.addEventListener("copy", preventActions);
    document.addEventListener("cut", preventActions);
    document.addEventListener("paste", preventActions);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("contextmenu", preventActions);
      document.removeEventListener("copy", preventActions);
      document.removeEventListener("cut", preventActions);
      document.removeEventListener("paste", preventActions);
    };
  }, [readOnly]);

  const loadQuiz = async () => {
    try {
      setLoading(true)
      if (!resolvedQuizId) {
        toast.error("Invalid quiz")
        navigate(-1)
        return
      }

      const quiz = await quizService.getQuizById(resolvedQuizId)
      const qlist = await quizService.getQuestionsByQuiz(resolvedQuizId)

      setQuizMeta(quiz)
      setQuestions(qlist || [])

      const duration = quiz?.duration || 10
      setTimeLeft(duration * 60)
      setTimerReady(true)
    } catch (err) {
      toast.error("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!timerReady || readOnly || submittedResult) return

    if (timeLeft === 30) {
      toast("⏰ Only 30 seconds left! Your answers will be auto-submitted.", {
        icon: "⚠️",
        duration: 5000,
      })
    }

    if (timeLeft <= 0) {
      setShowTimeUp(true)
      handleSubmit(true)
      return
    }

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, timerReady, readOnly, submittedResult])

  // ---------------- ANSWER ----------------
  const handleSelect = (qid, option) => {
    setAnswers((p) => ({ ...p, [qid]: option }))
  }

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (auto = false) => {
    if (readOnly || submitting) return
    setSubmitting(true)

    try {
      const payload = {
        studentId: user.studentId,
        topicId: state?.topicId || quizMeta?.topic?.id,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        answers: Object.entries(answers).map(([qid, ans]) => ({
          questionId: Number(qid),
          answerText: ans,
        })),
      }

      const res = await submitAttempt(resolvedQuizId, payload)
      setSubmittedResult(res)

      if (!auto) toast.success("Quiz submitted")
    } catch {
      toast.error("Submit failed")
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------- RETRY / BACK ----------------
  const handleRetry = () => {
    setSubmittedResult(null)
    setAnswers({})
    setPage(0)
    setSubmitting(false)

    // Reset timer
    const duration = quizMeta?.duration || 10
    setTimeLeft(duration * 60)
    setTimerReady(true)
  }

  const handleBackToCourse = () => {
    // If courseId was passed in state, use it. Otherwise fallback to dashboard or history.
    const courseId = state?.courseId || quizMeta?.courseId || quizMeta?.topic?.courseId
    if (courseId) {
      navigate(`/courses/${courseId}`, { state: { forceReload: Date.now() } })
    } else {
      // Fallback: Check history or dashboard
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    }
  }

  if (loading) return <Loader />
  if (submittedResult) {
    return (
      <QuizResult
        result={submittedResult}
        onRetry={handleRetry}
        onBack={handleBackToCourse}
      />
    )
  }

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const q = questions[page]

  return (
    <div className="min-h-screen bg-gray-100 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Button for Instructors / View Mode */}
        {user?.role === 'INSTRUCTOR' && (
          <button
            onClick={handleBackToCourse}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Course</span>
          </button>
        )}

        <Card className="p-8">
          {!readOnly && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6 text-sm text-yellow-800">
              <p>⚠️ <strong>Warning:</strong> Anti-Cheat Enabled. Do not switch tabs, minimize the browser, or try to copy text. The quiz will <strong>auto-submit</strong> immediately.</p>
            </div>
          )}

          {/* ===== TITLE ROW (NOT A HEADER) ===== */}
          <div className="flex items-start justify-between mb-6">

            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                {user.role === "STUDENT"
                  ? (quizMeta?.topic?.name
                    ? `${quizMeta?.topic?.name} Assessment`
                    : quizMeta?.title?.replace(/-?\s*(AI|Manual)\s*Quiz/gi, "").trim())
                  : quizMeta?.title}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {quizMeta?.topic?.name} • Question {page + 1} of {questions.length}
              </p>

              {user.role === "INSTRUCTOR" && (
                <span
                  className={`inline-block mt-2 px-2 py-0.5 text-xs rounded
          ${quizMeta?.generatedByAI
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"}`}
                >
                  {quizMeta?.generatedByAI ? "AI Generated" : "Manual Quiz"}
                </span>
              )}
            </div>

            {!readOnly && timeLeft !== null && (
              <div
                className={`text-sm font-semibold px-3 py-1 rounded-md
        ${timeLeft <= 60
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : timeLeft <= 180
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"}`}
              >
                ⏱ {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </div>
            )}
          </div>

          {/* ===== QUESTION ===== */}
          <div className="mb-8">
            <p className="text-xl font-medium text-gray-900">
              {page + 1}. {q.questionText}
            </p>
          </div>

          {/* ===== OPTIONS ===== */}
          <div className="space-y-4">
            {q.answers.map(opt => {
              const selected = answers[q.id] === opt.optionText

              return (
                <div
                  key={opt.id}
                  onClick={() => !readOnly && handleSelect(q.id, opt.optionText)}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition
    ${selected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"}
    ${readOnly ? "cursor-default" : ""}`}
                >

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center
            ${selected ? "border-blue-600" : "border-gray-400"}`}
                  >
                    {/* {selected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />} */}
                    {selected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}

                  </div>

                  {/* <span className="text-gray-800">{opt.optionText}</span> */}
                  <span className="text-gray-800 text-sm leading-snug">
                    {opt.optionText}
                  </span>

                </div>
              )
            })}
          </div>

          {/* ===== INSTRUCTOR ANSWER ===== */}
          {readOnly && (
            q.correctAnswer ? (
              <p className="mt-6 text-green-700 font-medium">
                ✔ Correct Answer: {q.correctAnswer}
              </p>
            ) : (
              <p className="mt-6 text-yellow-600 italic text-sm">
                Correct answer not available
              </p>
            )
          )}

          {/* ===== NAVIGATION ===== */}
          <div className="flex justify-between mt-10">
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>

            {page === totalPages - 1 ? (
              !readOnly && (
                <Button
                  variant="primary"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )
            ) : (
              <Button
                variant="primary"
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            )}
          </div>

        </Card>
      </div>
    </div>
  )
}

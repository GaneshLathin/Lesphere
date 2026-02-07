import React, { useEffect, useState } from 'react'
import { quizService } from '../../services/quizService'
import { useSelector } from 'react-redux'
import Card from '../common/Card'
import Button from '../common/Button'
import toast from 'react-hot-toast'

const QuizAttempt = ({ quizId, topicId, onFinished }) => {
  const { user } = useSelector(s => s.auth)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const res = await quizService.getQuizByTopic(topicId)
      // expecting res.data.ai style or Quiz object; adjust as needed
      setQuiz(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        studentId: user.userId,
        timeSpent: 0,
        topicId,
        answers: Object.keys(answers).map(qid => ({
          questionId: qid,
          answerText: answers[qid]
        }))
      }
      const res = await quizService.submitAttempt(quizId, payload)
      toast.success('Attempt saved. Score: ' + res.data.score)
      if (onFinished) onFinished(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Card className="p-6">Loading...</Card>
  if (!quiz) return <Card className="p-6">No quiz available</Card>

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-3">{quiz.title || 'Quiz'}</h3>
      <div className="space-y-4">
        {quiz.questions?.map((q) => (
          <div key={q.id || q.questionId} className="p-3 border rounded">
            <div className="font-medium">{q.questionText}</div>
            {q.options ? (
              <div className="mt-2 space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input type="radio" name={q.id} value={opt} onChange={() => handleChange(q.id, opt)} />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea onChange={(e) => handleChange(q.id, e.target.value)} className="w-full mt-2 p-2 border rounded" rows={3} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end mt-4">
        <Button onClick={handleSubmit} disabled={submitting} variant="primary">
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </Card>
  )
}

export default QuizAttempt

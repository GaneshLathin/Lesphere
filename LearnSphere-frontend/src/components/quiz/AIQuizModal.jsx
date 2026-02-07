// src/components/Quiz/AIQuizModal.jsx
import React, { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import Input from '../common/Input'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { generateAIQuiz, saveAIQuiz } from '../../services/aiApi'
import * as quizApi from '../../services/quizApi'

export default function AIQuizModal({ topicId, courseId, onClose, onSaved }) {
  const { user } = useSelector(state => state.auth)
  const [topicName, setTopicName] = useState('')
  const [difficulty, setDifficulty] = useState('BEGINNER')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [loading, setLoading] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)

  const handleGenerate = async () => {
    if (!topicName) return toast.error('Enter topic name')
    setLoading(true)
    try {
      const body = { topicName, difficulty, numberOfQuestions }
      const data = await generateAIQuiz(body)
      setGeneratedQuiz(data)
      toast.success('AI generated questions. Review and save.')
    } catch (err) {
      console.error(err)
      toast.error('AI generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedQuiz) return toast.error('No generated quiz to save')
    try {
      const payload = {
        instructorId: user.userId,
        courseId,
        topicId,
        title: `${topicName} - AI Quiz`,
        aiResponse: generatedQuiz
      }
      const saved = await quizApi.saveAIQuiz(payload)
      toast.success('Quiz saved')
      if (onSaved) onSaved(saved)
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Quiz Generator</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Input label="Topic Name" value={topicName} onChange={(e) => setTopicName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Questions</label>
            <input type="number" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded" min={1} />
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <Button onClick={handleGenerate} variant="primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          {generatedQuiz && (
            <Button onClick={handleSave} variant="success">Save Quiz</Button>
          )}
        </div>

        {generatedQuiz && (
          <div className="space-y-2">
            {generatedQuiz.questions?.map((q, idx) => (
              <div key={idx} className="p-3 border rounded bg-white">
                <div className="font-medium">{idx + 1}. {q.questionText}</div>
                {q.options && (
                  <ul className="text-sm text-gray-600 mt-2 list-disc ml-5">
                    {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                  </ul>
                )}
                <div className="text-xs text-gray-500 mt-1">Answer: {q.correctAnswer}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { quizStatisticsService } from '../../services/quizStatisticsService'
import { 
  TrendingUp, 
  Award, 
  Target, 
  Clock, 
  CheckCircle, 
  BarChart3,
  TrendingDown,
  AlertCircle
} from 'lucide-react'
import Card from '../common/Card'
import Loader from '../common/Loader'
import toast from 'react-hot-toast'

/**
 * Quiz Statistics Dashboard Component
 * Shows comprehensive quiz performance tracking
 */
const QuizStatistics = ({ courseId }) => {
  const { user } = useSelector((state) => state.auth)
  const [statistics, setStatistics] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, history, performance

  useEffect(() => {
    if (user?.studentId && courseId) {
      loadQuizStatistics()
    }
  }, [user, courseId])

  const loadQuizStatistics = async () => {
    try {
      setLoading(true)
      
      // Load both statistics and tracking data
      const [statsResponse, trackingResponse] = await Promise.all([
        quizStatisticsService.getCourseQuizStatistics(user.studentId, courseId),
        quizStatisticsService.getQuizTracking(user.studentId, courseId)
      ])

      setStatistics(statsResponse.data)
      setTracking(trackingResponse.data)
    } catch (error) {
      console.error('Error loading quiz statistics:', error)
      toast.error('Failed to load quiz statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (!statistics) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">No quiz data available</p>
      </Card>
    )
  }

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200'
      case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'AVERAGE': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'NEEDS_IMPROVEMENT': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Performance Level */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Quiz Performance Tracker</h2>
            <p className="text-blue-100">{statistics.courseName}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{statistics.averageScore}%</div>
            <div className="text-sm text-blue-100">Average Score</div>
          </div>
        </div>
      </Card>

      {/* Performance Banner */}
      <Card className={`p-4 border-2 ${getPerformanceColor(statistics.performanceLevel)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award size={32} />
            <div>
              <div className="font-bold text-lg">{statistics.performanceLevel.replace('_', ' ')}</div>
              <div className="text-sm">{statistics.performanceMessage}</div>
            </div>
          </div>
          {statistics.isImproving && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +{statistics.improvementRate}% Improvement
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quizzes Taken */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalQuizzesTaken}</p>
              <p className="text-xs text-gray-500">
                of {statistics.totalQuizzesAvailable} available
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${statistics.completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{statistics.completionRate}% Complete</p>
          </div>
        </Card>

        {/* Average Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.averageScore}%</p>
              <p className="text-xs text-gray-500">
                Highest: {statistics.highestScore}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Target className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Accuracy Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.accuracyRate}%</p>
              <p className="text-xs text-gray-500">
                {statistics.totalCorrectAnswers} of {statistics.totalQuestions} correct
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Time Spent */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(statistics.totalTimeSpent / 60)}m
              </p>
              <p className="text-xs text-gray-500">
                Avg: {Math.floor(statistics.averageTimePerQuiz / 60)}m per quiz
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent Attempts
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Performance Analysis
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Score Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Highest Score</span>
                  <span className="font-bold text-green-600">{statistics.highestScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-bold text-blue-600">{statistics.averageScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lowest Score</span>
                  <span className="font-bold text-red-600">{statistics.lowestScore}%</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-gray-600">Total Score</span>
                  <span className="font-bold text-gray-900">{statistics.totalScore}%</span>
                </div>
              </div>
            </Card>

            {/* Progress Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Progress Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {statistics.isImproving ? (
                    <TrendingUp className="text-green-600 mt-1" size={20} />
                  ) : (
                    <TrendingDown className="text-orange-600 mt-1" size={20} />
                  )}
                  <div>
                    <div className="font-medium">
                      {statistics.isImproving ? 'Improving Trend' : 'Stable Performance'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {statistics.isImproving
                        ? `Your scores have improved by ${statistics.improvementRate}%`
                        : 'Keep practicing to see improvement'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="text-purple-600 mt-1" size={20} />
                  <div>
                    <div className="font-medium">Completion Rate</div>
                    <div className="text-sm text-gray-600">
                      {statistics.completionRate}% of available quizzes completed
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="text-blue-600 mt-1" size={20} />
                  <div>
                    <div className="font-medium">Accuracy</div>
                    <div className="text-sm text-gray-600">
                      {statistics.accuracyRate}% correct answers overall
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'history' && tracking && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Recent Quiz Attempts</h3>
            {tracking.recentAttempts && tracking.recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {tracking.recentAttempts.map((attempt) => (
                  <Card key={attempt.attemptId} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{attempt.quizTitle}</h4>
                        <p className="text-sm text-gray-600">{attempt.topicName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            Score: <span className="font-medium">{attempt.score}%</span>
                          </span>
                          <span className="text-gray-600">
                            {attempt.correctAnswers}/{attempt.totalQuestions} correct
                          </span>
                          <span className="text-gray-600">
                            Time: {Math.floor(attempt.timeSpent / 60)}m
                          </span>
                        </div>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${attempt.performanceColor}20`,
                          color: attempt.performanceColor 
                        }}
                      >
                        {attempt.performanceLevel}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">No quiz attempts yet</p>
            )}
          </div>
        )}

        {activeTab === 'performance' && tracking && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performances */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" size={20} />
                Top Performances
              </h3>
              {tracking.topPerformances && tracking.topPerformances.length > 0 ? (
                <div className="space-y-3">
                  {tracking.topPerformances.map((attempt, index) => (
                    <div key={attempt.attemptId} className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-300">{index + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{attempt.quizTitle}</div>
                        <div className="text-xs text-gray-600">
                          {attempt.score}% • {attempt.correctAnswers}/{attempt.totalQuestions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No quiz attempts yet</p>
              )}
            </Card>

            {/* Needs Improvement */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-500" size={20} />
                Areas to Improve
              </h3>
              {tracking.needsImprovement && tracking.needsImprovement.length > 0 ? (
                <div className="space-y-3">
                  {tracking.needsImprovement.map((attempt) => (
                    <div key={attempt.attemptId} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{attempt.quizTitle}</div>
                        <div className="text-xs text-gray-600">
                          {attempt.score}% • Review this topic
                        </div>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Retry
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-600">Great job! No areas need improvement.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizStatistics

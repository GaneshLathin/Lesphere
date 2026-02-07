import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { quizStatisticsService } from '../../services/quizStatisticsService'
import { Award, TrendingUp, Target, Clock } from 'lucide-react'
import Card from '../common/Card'
import Loader from '../common/Loader'

/**
 * Quiz Statistics Summary Card
 * Compact view for displaying quiz stats in dashboards
 */
const QuizStatisticsSummary = ({ courseId, showOverall = false, onViewDetails }) => {
  const { user } = useSelector((state) => state.auth)
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.studentId) {
      loadStatistics()
    }
  }, [user, courseId, showOverall])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = showOverall
        ? await quizStatisticsService.getOverallQuizStatistics(user.studentId)
        : await quizStatisticsService.getCourseQuizStatistics(user.studentId, courseId)
      
      setStatistics(response.data)
    } catch (error) {
      console.error('Error loading quiz statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <Loader />
      </Card>
    )
  }

  if (!statistics) return null

  const getPerformanceGradient = (level) => {
    switch (level) {
      case 'EXCELLENT': return 'from-green-500 to-emerald-600'
      case 'GOOD': return 'from-blue-500 to-indigo-600'
      case 'AVERAGE': return 'from-yellow-500 to-orange-600'
      case 'NEEDS_IMPROVEMENT': return 'from-red-500 to-pink-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${getPerformanceGradient(statistics.performanceLevel)} text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Quiz Performance</h3>
            <p className="text-sm text-white/80">{statistics.courseName}</p>
          </div>
          <Award size={32} className="text-white/80" />
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">{statistics.averageScore}%</div>
          <div className="text-sm text-white/80">{statistics.performanceLevel.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-white">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.totalQuizzesTaken}</div>
          <div className="text-xs text-gray-600">Quizzes Taken</div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.accuracyRate}%</div>
          <div className="text-xs text-gray-600">Accuracy</div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.highestScore}%</div>
          <div className="text-xs text-gray-600">Best Score</div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="text-orange-600" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.floor(statistics.totalTimeSpent / 60)}m</div>
          <div className="text-xs text-gray-600">Total Time</div>
        </div>
      </div>

      {/* Performance Message */}
      <div 
        className="px-6 py-3 border-t"
        style={{ backgroundColor: `${statistics.performanceColor}10` }}
      >
        <p className="text-sm text-center" style={{ color: statistics.performanceColor }}>
          {statistics.performanceMessage}
        </p>
      </div>

      {/* View Details Button */}
      {onViewDetails && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={onViewDetails}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Detailed Statistics
          </button>
        </div>
      )}
    </Card>
  )
}

export default QuizStatisticsSummary

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { dashboardService } from '../../services/dashboardService'
import { 
  Award, BookOpen, Clock, TrendingUp, Target, Video, FileText, 
  Trophy, Zap, Calendar, CheckCircle, Activity, BarChart3,
  Brain, Star
} from 'lucide-react'
import Card from '../common/Card'
import Loader from '../common/Loader'

/**
 * Comprehensive Dashboard Overview Component
 * Displays overall performance across courses, quizzes, topics, videos, and materials
 */
const DashboardOverview = () => {
  const { user } = useSelector((state) => state.auth)
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview') // overview, details, courses

  useEffect(() => {
    if (user?.studentId) {
      loadDashboardStatistics()
    }
  }, [user])

  const loadDashboardStatistics = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.getOverallStatistics(user.studentId)
      setStatistics(response.data)
    } catch (error) {
      console.error('Error loading dashboard statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  if (!statistics) return null

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50'
      case 'GOOD': return 'text-blue-600 bg-blue-50'
      case 'AVERAGE': return 'text-yellow-600 bg-yellow-50'
      case 'NEEDS_IMPROVEMENT': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'EXPERT': return 'from-purple-500 to-pink-600'
      case 'ADVANCED': return 'from-blue-500 to-indigo-600'
      case 'INTERMEDIATE': return 'from-green-500 to-teal-600'
      case 'BEGINNER': return 'from-yellow-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Performance Overview */}
      <Card className="overflow-hidden">
        <div className={`p-8 bg-gradient-to-br ${getSkillLevelColor(statistics.performanceOverview?.skillLevel)} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Learning Journey</h2>
              <p className="text-white/80 text-lg">
                Skill Level: {statistics.performanceOverview?.skillLevel || 'BEGINNER'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Brain size={48} className="text-white/90" />
              </div>
              <div className="text-5xl font-bold">
                {statistics.performanceOverview?.overallSkillScore || 0}
              </div>
              <div className="text-sm text-white/80">Overall Score</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{statistics.performanceOverview?.overallProgress?.toFixed(1) || 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${statistics.performanceOverview?.overallProgress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedView('overview')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedView === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedView('details')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedView === 'details'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Detailed Stats
        </button>
        <button
          onClick={() => setSelectedView('courses')}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedView === 'courses'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Course Performance
        </button>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Courses */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.totalCoursesEnrolled || 0}
                  </div>
                  <div className="text-sm text-gray-600">Courses Enrolled</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✓ {statistics.coursesCompleted || 0} Completed</span>
                <span className="text-blue-600">→ {statistics.coursesInProgress || 0} In Progress</span>
              </div>
            </Card>

            {/* Quizzes */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Award className="text-purple-600" size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.quizMetrics?.averageScore?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Quiz Average</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{statistics.quizMetrics?.totalQuizzesTaken || 0} Taken</span>
                <span className={`font-medium ${getPerformanceColor(statistics.quizMetrics?.performanceLevel)}`}>
                  {statistics.quizMetrics?.performanceLevel?.replace('_', ' ') || 'N/A'}
                </span>
              </div>
            </Card>

            {/* Topics */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Target className="text-green-600" size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.topicMetrics?.topicsCompleted || 0}
                  </div>
                  <div className="text-sm text-gray-600">Topics Completed</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">of {statistics.topicMetrics?.totalTopicsAvailable || 0} total</span>
                <span className="text-green-600">{statistics.topicMetrics?.completionRate?.toFixed(1) || 0}%</span>
              </div>
            </Card>

            {/* Time */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor((statistics.timeMetrics?.totalLearningTimeMinutes || 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Learning Time</div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {statistics.timeMetrics?.averageSessionTimeMinutes || 0}m avg
                </span>
                <span className="text-orange-600">
                  {Math.floor((statistics.timeMetrics?.totalQuizTimeMinutes || 0) / 60)}h quiz
                </span>
              </div>
            </Card>
          </div>

          {/* Materials and Videos Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Videos */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Video className="text-red-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Video Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Videos Watched</span>
                  <span className="font-semibold">
                    {statistics.materialMetrics?.videos?.videosWatched || 0} / {statistics.materialMetrics?.videos?.totalVideos || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 rounded-full h-2 transition-all"
                    style={{ width: `${statistics.materialMetrics?.videos?.completionRate || 0}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {statistics.materialMetrics?.videos?.completionRate?.toFixed(1) || 0}% complete
                </div>
              </div>
            </Card>

            {/* Documents */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FileText className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Document Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents Read</span>
                  <span className="font-semibold">
                    {statistics.materialMetrics?.documents?.documentsRead || 0} / {statistics.materialMetrics?.documents?.totalDocuments || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 rounded-full h-2 transition-all"
                    style={{ width: `${statistics.materialMetrics?.documents?.completionRate || 0}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {statistics.materialMetrics?.documents?.completionRate?.toFixed(1) || 0}% complete
                </div>
              </div>
            </Card>
          </div>

          {/* Streak and Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Streak Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Zap className="text-yellow-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Learning Streak</h3>
              </div>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {statistics.streakInfo?.currentStreak || 0} 🔥
                </div>
                <div className="text-gray-600">
                  {statistics.streakInfo?.isActiveToday ? "You're on fire today!" : 'Study today to keep the streak!'}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Active {statistics.streakInfo?.activeDaysThisWeek?.length || 0} days this week
                </div>
              </div>
            </Card>

            {/* Badges */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Trophy className="text-pink-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {statistics.badges && statistics.badges.length > 0 ? (
                  statistics.badges.map((badge, index) => (
                    <div key={index} className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                      <Star size={14} />
                      {badge}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Complete more activities to earn badges!</p>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          {statistics.recentActivities && statistics.recentActivities.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="text-green-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {statistics.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.activityType === 'QUIZ_COMPLETED' ? 'bg-purple-100' :
                        activity.activityType === 'TOPIC_COMPLETED' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        {activity.activityType === 'QUIZ_COMPLETED' ? <Award size={16} className="text-purple-600" /> :
                         activity.activityType === 'TOPIC_COMPLETED' ? <CheckCircle size={16} className="text-green-600" /> :
                         <BookOpen size={16} className="text-blue-600" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.courseName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <div className="text-sm font-semibold text-purple-600">{activity.score}</div>
                      )}
                      <div className="text-xs text-gray-500">{activity.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Detailed Stats Tab */}
      {selectedView === 'details' && (
        <div className="space-y-6">
          {/* Quiz Details */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="text-purple-600" size={24} />
              Quiz Performance Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Questions</div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.quizMetrics?.totalQuestionsAnswered || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Correct Answers</div>
                <div className="text-2xl font-bold text-green-600">
                  {statistics.quizMetrics?.totalCorrectAnswers || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Accuracy Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.quizMetrics?.accuracyRate?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Highest Score</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {statistics.quizMetrics?.highestScore || 0}%
                </div>
              </div>
            </div>

            {statistics.quizMetrics?.isImproving && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <TrendingUp className="text-green-600" size={24} />
                <div>
                  <div className="font-semibold text-green-900">You're Improving!</div>
                  <div className="text-sm text-green-700">
                    Your performance has improved by {statistics.quizMetrics.improvementRate?.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Materials Breakdown */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={24} />
              Learning Materials Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="text-red-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Videos</div>
                    <div className="text-sm text-gray-600">
                      {statistics.materialMetrics?.videos?.videosWatched || 0} of {statistics.materialMetrics?.videos?.totalVideos || 0}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {statistics.materialMetrics?.videos?.completionRate?.toFixed(0) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="text-indigo-600" size={20} />
                  <div>
                    <div className="font-medium text-gray-900">Documents</div>
                    <div className="text-sm text-gray-600">
                      {statistics.materialMetrics?.documents?.documentsRead || 0} of {statistics.materialMetrics?.documents?.totalDocuments || 0}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">
                    {statistics.materialMetrics?.documents?.completionRate?.toFixed(0) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Course Performance Tab */}
      {selectedView === 'courses' && (
        <div className="space-y-4">
          {statistics.coursePerformances && statistics.coursePerformances.length > 0 ? (
            statistics.coursePerformances.map((course, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{course.courseName}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getPerformanceColor(course.performanceLevel)}`}>
                      {course.performanceLevel?.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{course.completionPercentage?.toFixed(0) || 0}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{course.quizzesTaken || 0}</div>
                    <div className="text-xs text-gray-600">Quizzes</div>
                    <div className="text-sm font-semibold text-purple-700 mt-1">
                      {course.averageQuizScore?.toFixed(1) || 0}% avg
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{course.topicsCompleted || 0}</div>
                    <div className="text-xs text-gray-600">Topics</div>
                    <div className="text-sm text-green-700 mt-1">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{course.materialsCompleted || 0}</div>
                    <div className="text-xs text-gray-600">Materials</div>
                    <div className="text-sm text-blue-700 mt-1">Viewed</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2 transition-all"
                      style={{ width: `${course.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No course data available yet.</p>
              <p className="text-sm text-gray-500 mt-2">Start learning to see your performance!</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardOverview

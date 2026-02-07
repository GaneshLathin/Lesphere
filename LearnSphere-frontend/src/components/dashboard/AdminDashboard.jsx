import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { courseService } from '../../services/courseService'
import { Users, BookOpen, Award, DollarSign, TrendingUp } from 'lucide-react'
import Card from '../common/Card'
import Loader from '../common/Loader'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const coursesResponse = await courseService.getAllCourses()
      setCourses(coursesResponse.data.data.content || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate real statistics
  const totalCourses = courses.length
  const publishedCourses = courses.filter(c => c.isPublished).length
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)

  // Get unique instructors
  const uniqueInstructors = new Set(courses.map(c => c.instructorId))
  const totalInstructors = uniqueInstructors.size

  const stats = [
    {
      label: 'Total Courses',
      value: totalCourses.toString(),
      icon: BookOpen,
      color: 'bg-blue-500',
      change: `${publishedCourses} published`
    },
    {
      label: 'Total Enrollments',
      value: totalEnrollments.toString(),
      icon: Users,
      color: 'bg-green-500',
      change: 'Across all courses'
    },
    {
      label: 'Instructors',
      value: totalInstructors.toString(),
      icon: Award,
      color: 'bg-purple-500',
      change: 'Active instructors'
    },
    {
      label: 'Published Courses',
      value: publishedCourses.toString(),
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: `${totalCourses - publishedCourses} drafts`
    }
  ]

  // Get top courses by enrollment
  const topCourses = [...courses]
    .sort((a, b) => (b.totalEnrollments || 0) - (a.totalEnrollments || 0))
    .slice(0, 5)

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of platform analytics</p>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500">{stat.change}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Courses by Enrollment</h2>
          {topCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courses available</p>
          ) : (
            <div className="space-y-3">
              {topCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
                  // onClick={() => navigate(`/courses/${course.id}`)}
                  onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'dashboard' } })}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      By {course.instructorName} • {course.totalEnrollments || 0} students
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${course.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Courses */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Added Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courses available</p>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
                  // onClick={() => navigate(`/courses/${course.id}`)}
                  onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'dashboard' } })}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      {course.difficultyLevel} • {course.totalTopics || 0} topics
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${course.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    course.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {course.difficultyLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
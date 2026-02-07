import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { enrollmentService } from '../../services/enrollmentService'
import { courseService } from '../../services/courseService'
import { quizStatisticsService } from '../../services/quizStatisticsService'
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  X,
  Target,
  Search,
  AlertTriangle
} from 'lucide-react'
import Card from '../common/Card'
import Loader from '../common/Loader'
import Button from '../common/Button'
import Input from '../common/Input'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'

const EnrolledCourses = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const [quizStats, setQuizStats] = useState({
    overallScore: 0,
    aiQuizScore: 0,
    totalAttempts: 0,
  })

  // 🔍 Search / Filter / Sort
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [progressFilter, setProgressFilter] = useState('ALL')

  // 📄 Pagination
  const [page, setPage] = useState(0)
  const pageSize = 6

  // 🗑 Unenroll Modal State
  const [unenrollModalOpen, setUnenrollModalOpen] = useState(false)
  const [courseToUnenroll, setCourseToUnenroll] = useState(null)

  useEffect(() => {
    fetchEnrolledCourses()
    fetchQuizStatistics()
  }, [user])

  /* -------------------- SINGLE SOURCE OF TRUTH -------------------- */
  const getProgress = (course) =>
    course.enrollment?.completionPercentage ?? 0

  const getProgressColor = (percent) => {
    if (percent < 30) return '#ef4444'
    if (percent < 70) return '#facc15'
    return '#22c55e'
  }

  const fetchQuizStatistics = async () => {
    try {
      if (!user?.studentId) return
      const response =
        await quizStatisticsService.getOverallQuizStatistics(user.studentId)
      const stats = response?.data || response

      setQuizStats({
        overallScore: Math.round(stats?.averageScore || 0),
        aiQuizScore: Math.round(
          stats?.aiQuizAverageScore || stats?.averageScore || 0
        ),
        totalAttempts: stats?.totalAttempts || 0,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true)

      const enrollments =
        await enrollmentService.getStudentEnrollments(user.userId)

      const courses = await Promise.all(
        enrollments.map(async (enr) => {
          const res = await courseService.getCourseById(
            enr.courseId,
            user.userId
          )
          const course = res.data?.data ?? res.data
          return { ...course, enrollment: enr }
        })
      )

      setEnrolledCourses(courses)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch enrolled courses')
    } finally {
      setLoading(false)
    }
  }

  const initiateUnenroll = (course) => {
    setCourseToUnenroll(course)
    setUnenrollModalOpen(true)
  }

  const confirmUnenroll = async () => {
    if (!courseToUnenroll) return

    try {
      await enrollmentService.unenrollCourse(user.userId, courseToUnenroll.id)
      toast.success('Unenrolled successfully')
      fetchEnrolledCourses()
      setUnenrollModalOpen(false)
      setCourseToUnenroll(null)
    } catch {
      toast.error('Failed to unenroll')
    }
  }

  /* -------------------- FILTER + SORT (FIXED) -------------------- */
  const filteredCourses = useMemo(() => {
    let list = [...enrolledCourses]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      )
    }

    if (difficulty) {
      list = list.filter((c) => c.difficultyLevel === difficulty)
    }

    if (progressFilter === 'COMPLETED') {
      list = list.filter((c) => getProgress(c) >= 100)
    }

    if (progressFilter === 'INPROGRESS') {
      list = list.filter(
        (c) => getProgress(c) > 0 && getProgress(c) < 100
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return (
        new Date(b.enrollment?.lastAccessedAt || 0) -
        new Date(a.enrollment?.lastAccessedAt || 0)
      )
    })

    return list
  }, [enrolledCourses, search, difficulty, sortBy, progressFilter])

  /* -------------------- PAGINATION -------------------- */
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const paginatedCourses = filteredCourses.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  )

  /* -------------------- STATS (FIXED) -------------------- */
  const completedCount = enrolledCourses.filter(
    (c) => getProgress(c) >= 100
  ).length

  const inProgressCount = enrolledCourses.filter(
    (c) => getProgress(c) > 0 && getProgress(c) < 100
  ).length

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Enrolled Courses</h1>
      <p className="text-gray-600 mb-6">Continue your learning journey</p>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <Stat title="Total Enrolled" value={enrolledCourses.length} icon={BookOpen} color="bg-blue-500" />
        <Stat title="Completed" value={completedCount} icon={Award} color="bg-green-500" />
        <Stat title="In Progress" value={inProgressCount} icon={TrendingUp} color="bg-yellow-500" />
        <Stat
          title="Avg Progress"
          value={
            enrolledCourses.length
              ? Math.round(
                enrolledCourses.reduce(
                  (s, c) => s + getProgress(c),
                  0
                ) / enrolledCourses.length
              )
              : 0
          }
          icon={Clock}
          color="bg-purple-500"
        />
        <Stat title="MCQ Progress" value={`${quizStats.overallScore}%`} icon={Target} color="bg-indigo-500" />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Search size={18} />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
        </div>

        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(0) }} className="border p-2 rounded">
          <option value="">All Difficulty</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded">
          <option value="recent">Recently Accessed</option>
          <option value="title">Title A–Z</option>
        </select>

        <select value={progressFilter} onChange={(e) => { setProgressFilter(e.target.value); setPage(0) }} className="border p-2 rounded">
          <option value="ALL">All Courses</option>
          <option value="COMPLETED">Completed</option>
          <option value="INPROGRESS">In Progress</option>
        </select>
      </div>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCourses.map((course) => {
          const progress = getProgress(course)

          return (
            <Card key={course.id} hover className="overflow-hidden">
              <div
                className="h-48 relative cursor-pointer"
                onClick={() =>
                  navigate(`/courses/${course.id}`, {
                    state: { from: 'enrolled', courseId: course.id },
                  })
                }
              >
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <BookOpen size={64} className="text-white" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex justify-between text-white text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: getProgressColor(progress),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Play}
                    className="flex-1"
                    onClick={() =>
                      navigate(`/courses/${course.id}`, {
                        state: { from: 'enrolled', courseId: course.id },
                      })
                    }
                  >
                    Continue
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={X}
                    onClick={() => initiateUnenroll(course)}
                  >
                    Unenroll
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`px-3 py-2 rounded ${safePage === i
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={safePage === totalPages - 1}
            onClick={() => setPage(safePage + 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* UNENROLL MODAL */}
      <Modal
        isOpen={unenrollModalOpen}
        onClose={() => setUnenrollModalOpen(false)}
        title="Unenroll Course"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to unenroll from <span className="font-semibold text-gray-800">"{courseToUnenroll?.title}"</span>?
            This action cannot be undone and all progress will be lost.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setUnenrollModalOpen(false)}
              className="px-5 border-gray-200 text-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmUnenroll}
              className="px-5 bg-red-600 text-white hover:bg-red-700 shadow-red-200"
            >
              Unenroll
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const Stat = ({ title, value, icon: Icon, color }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  </Card>
)

export default EnrolledCourses

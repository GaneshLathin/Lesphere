// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import { courseService } from '../../services/courseService'
// import { BookOpen, Users, Award, TrendingUp, Plus, Edit, Eye, EyeOff } from 'lucide-react'
// import Card from '../common/Card'
// import Button from '../common/Button'
// import Loader from '../common/Loader'
// import toast from 'react-hot-toast'

// const InstructorDashboard = () => {
//   const navigate = useNavigate()
//   const { user } = useSelector((state) => state.auth)
//   const [courses, setCourses] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (user?.userId) {
//       fetchCourses()
//     }
//   }, [user])

//   const fetchCourses = async () => {
//     try {
//       setLoading(true)
//       const list = await courseService.getInstructorCourses(user.userId)
//       console.log('Instructor courses:', list)
//       setCourses(Array.isArray(list) ? list : [])
//     } catch (error) {
//       console.error('Error fetching courses:', error)
//       toast.error('Failed to fetch courses')
//       setCourses([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePublishToggle = async (courseId, currentStatus) => {
//     try {
//       if (!currentStatus) {
//         // Publish the course
//         await courseService.publishCourse(courseId)
//         toast.success('Course published successfully!')
//       } else {
//         toast.info('Unpublish feature coming soon!')
//         return
//       }

//       // Refresh courses
//       await fetchCourses()
//     } catch (error) {
//       toast.error('Failed to update course status')
//     }
//   }

//   // Calculate real stats from courses
//   const publishedCourses = courses.filter(c => c.isPublished)
//   const draftCourses = courses.filter(c => !c.isPublished)
//   const totalStudents = courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)

//   const stats = [
//     { 
//       label: 'Total Courses', 
//       value: courses.length.toString(), 
//       icon: BookOpen, 
//       color: 'bg-blue-500' 
//     },
//     { 
//       label: 'Total Students', 
//       value: totalStudents.toString(), 
//       icon: Users, 
//       color: 'bg-green-500' 
//     },
//     { 
//       label: 'Published', 
//       value: publishedCourses.length.toString(), 
//       icon: Award, 
//       color: 'bg-purple-500' 
//     },
//     { 
//       label: 'Draft', 
//       value: draftCourses.length.toString(), 
//       icon: TrendingUp, 
//       color: 'bg-yellow-500' 
//     }
//   ]

//   if (loading) return <Loader />

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//             Instructor Dashboard
//           </h1>
//           <p className="text-gray-600">Manage your courses and track student progress</p>
//         </div>
//         <Button
//           onClick={() => navigate('/courses/create')}
//           variant="primary"
//           icon={Plus}
//         >
//           Create Course
//         </Button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {stats.map((stat) => {
//           const Icon = stat.icon
//           return (
//             <Card key={stat.label} className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
//                   <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
//                 </div>
//                 <div className={`${stat.color} p-3 rounded-lg`}>
//                   <Icon size={24} className="text-white" />
//                 </div>
//               </div>
//             </Card>
//           )
//         })}
//       </div>

//       {/* Draft vs Published Explanation */}
//       <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
//         <div className="flex items-start space-x-3">
//           <div className="flex-shrink-0">
//             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
//               <span className="text-white font-bold">i</span>
//             </div>
//           </div>
//           <div>
//             <h3 className="font-semibold text-blue-900 mb-1">About Draft & Published Courses</h3>
//             <p className="text-sm text-blue-800">
//               <strong>Draft:</strong> Courses that are not visible to students. Use this to prepare content before making it public.<br/>
//               <strong>Published:</strong> Courses that are live and visible to students. Click the "Publish" button to make a draft course available to students.
//             </p>
//           </div>
//         </div>
//       </Card>

//       {/* My Courses */}
//       <Card className="p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
//           <Button
//             onClick={() => navigate('/courses')}
//             variant="outline"
//             size="sm"
//           >
//             View All
//           </Button>
//         </div>

//         {courses.length === 0 ? (
//           <div className="text-center py-12">
//             <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
//             <p className="text-gray-600 mb-4">Create your first course to get started</p>
//             <Button
//               onClick={() => navigate('/courses/create')}
//               variant="primary"
//             >
//               Create Your First Course
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {courses.map((course) => (
//               <div
//                 key={course.id}
//                 className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <div 
//                   className="flex-1 cursor-pointer"
//                   // onClick={() => navigate(`/courses/${course.id}`)}
//                   // onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'dashboard' } })}
//                   onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'dashboard', courseId: course.id } })}

//                 >

//                   <div className="flex items-center space-x-3 mb-1">
//                     <h3 className="font-semibold text-gray-900">{course.title}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       course.isPublished 
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {course.isPublished ? '✓ Published' : '○ Draft'}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500">
//                     {course.totalEnrollments || 0} students • {course.totalTopics || 0} topics
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   {!course.isPublished && (
//                     <Button
//                       onClick={() => handlePublishToggle(course.id, course.isPublished)}
//                       variant="success"
//                       size="sm"
//                       icon={Eye}
//                     >
//                       Publish
//                     </Button>
//                   )}
//                   <Button
//                     onClick={() => navigate(`/courses/edit/${course.id}`)}
//                     variant="secondary"
//                     size="sm"
//                     icon={Edit}
//                   >
//                     Edit
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }

// export default InstructorDashboard


import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseService } from "../../services/courseService";
import analyticsService from "../../services/analyticsService";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Search,
} from "lucide-react";

import Card from "../common/Card";
import Button from "../common/Button";
import Loader from "../common/Loader";
import Input from "../common/Input";
import toast from "react-hot-toast";
import InstructorReports from "./analytics/instructor/InstructorReports";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");

  // Pagination
  const [page, setPage] = useState(0);
  const size = 7;

  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchCourses();
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await analyticsService.getInstructorAnalytics();
      setStatsData(data);
    } catch (e) {
      console.error("Stats fetch error", e);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const list = await courseService.getInstructorCourses(user.userId);
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
  const handlePublishToggle = async (courseId) => {
    try {
      await courseService.publishCourse(courseId);

      toast.success("Course published successfully");

      fetchCourses(); // refresh list
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish course");
    }
  };


  const filteredResult = useMemo(() => {
    let list = [...courses];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }

    // status
    if (status !== "") list = list.filter((c) => c.isPublished === (status === "true"));

    // difficulty
    if (difficulty) list = list.filter((c) => c.difficultyLevel === difficulty);

    // sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return direction === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case "duration":
          return direction === "asc" ? a.duration - b.duration : b.duration - a.duration;
        default:
          return direction === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(list.length / size));
    const safePage = Math.min(page, totalPages - 1);
    const paginated = list.slice(safePage * size, safePage * size + size);

    return { paginated, totalPages, safePage };
  }, [courses, search, status, difficulty, sortBy, direction, page]);

  useEffect(() => setPage(0), [search, status, difficulty, sortBy, direction]);

  const { paginated, totalPages, safePage } = filteredResult;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          disabled={safePage === 0}
          onClick={() => setPage(Math.max(0, safePage - 1))}
          className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-40"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 rounded ${safePage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
              } transition`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={safePage === totalPages - 1}
          onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
          className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  // Stats
  const publishedCourses = courses.filter((c) => c.isPublished);
  const draftCourses = courses.filter((c) => !c.isPublished);

  // Use authoritative distinct count if available, else fallback to naive sum
  const distinctStudents = statsData?.summary?.totalStudents;
  const naiveTotal = courses.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0);
  const displayStudents = distinctStudents !== undefined ? distinctStudents : naiveTotal;

  const stats = [
    { label: "Total Courses", value: courses.length, icon: BookOpen, color: "bg-blue-500" },
    { label: "Total Students", value: displayStudents, icon: Users, color: "bg-green-500" },
    { label: "Published", value: publishedCourses.length, icon: Award, color: "bg-purple-500" },
    { label: "Draft", value: draftCourses.length, icon: TrendingUp, color: "bg-yellow-500" },
  ];

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600">Manage your courses and track student progress</p>
        </div>

        <Button onClick={() => navigate("/courses/create")} icon={Plus}>
          Create Course
        </Button>
      </div>

      {/* TABS */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`pb-2 px-4 ${!location.search.includes('tab=reports') ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => navigate('/instructor/dashboard')}
        >
          Overview
        </button>
        <button
          className={`pb-2 px-4 ${location.search.includes('tab=reports') ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => navigate('/instructor/dashboard?tab=reports')}
        >
          Reports
        </button>
      </div>

      {location.search.includes('tab=reports') ? (
        <InstructorReports />
      ) : (
        <>
          {/* STATS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* MY COURSES */}
          <Card className="p-6">

            <h2 className="text-xl font-bold mb-4">My Courses</h2>

            {/* FILTER BAR — Enhanced UI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 border rounded-lg mb-6">

              {/* Search */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border p-2 rounded bg-white"
              >
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>

              {/* Difficulty */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border p-2 rounded bg-white"
              >
                <option value="">Difficulty</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${direction}`}
                onChange={(e) => {
                  const [s, d] = e.target.value.split("-");
                  setSortBy(s);
                  setDirection(d);
                }}
                className="border p-2 rounded bg-white"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">A → Z</option>
                <option value="duration-asc">Duration Low → High</option>
              </select>
            </div>

            {/* COURSE LIST */}
            {paginated.length === 0 ? (
              <p className="text-center py-6 text-gray-600">No courses found</p>
            ) : (
              paginated.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg mb-3 hover:bg-gray-50 transition shadow-sm"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/courses/${course.id}`, { state: { from: "dashboard" } })}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${course.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {course.totalEnrollments || 0} students • {course.totalTopics || 0} topics
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!course.isPublished && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handlePublishToggle(course.id, course.isPublished)}
                        icon={Eye}
                      >
                        Publish
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Edit}
                      onClick={() => navigate(`/courses/edit/${course.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}

            {renderPagination()}
          </Card>
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;

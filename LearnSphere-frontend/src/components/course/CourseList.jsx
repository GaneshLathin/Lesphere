/* eslint-disable no-console */

// import React, { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import { courseService } from '../../services/courseService'
// import { BookOpen, Users, Clock, Plus, Edit, Trash2 } from 'lucide-react'
// import Card from '../common/Card'
// import Loader from '../common/Loader'
// import Button from '../common/Button'
// import toast from 'react-hot-toast'

// const CourseList = () => {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { user } = useSelector((state) => state.auth)
//   const { loading } = useSelector((state) => state.course)

//   const [courses, setCourses] = useState([])
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [courseToDelete, setCourseToDelete] = useState(null)
//   const [deleting, setDeleting] = useState(false)

//   useEffect(() => {
//     fetchCourses()
//   }, [user])

//   const getProgressColor = (percent) => {
//     if (percent < 30) return "#ef4444"     // RED
//     if (percent < 70) return "#facc15"     // YELLOW
//     return "#22c55e"                       // GREEN
//   }

//   const fetchCourses = async () => {
//     try {
//       let response

//       if (user?.role === 'INSTRUCTOR') {
//         response = await courseService.getInstructorCourses(user.userId)

//       } else if (user?.role === 'STUDENT') {
//         response = await courseService.getPublishedCourses(user.userId)

//       } else {
//         response = await courseService.getAllCourses()
//       }

//       console.log('Fetched courses:', response.data)
//       setCourses(response.data || [])
//     } catch (error) {
//       console.error('Error fetching courses:', error)
//       toast.error('Failed to fetch courses')
//       setCourses([])
//     }
//   }

//   const handleDelete = (e, course) => {
//     e.stopPropagation()
//     setCourseToDelete(course)
//     setShowDeleteModal(true)
//   }

//   const confirmDelete = async () => {
//     if (!courseToDelete) return

//     setDeleting(true)
//     try {
//       await courseService.deleteCourse(courseToDelete.id)

//       setCourses(prev => prev.filter(c => c.id !== courseToDelete.id))

//       toast.success('Course deleted successfully!')
//       setShowDeleteModal(false)
//       setCourseToDelete(null)

//     } catch (error) {
//       console.error('Delete error:', error)
//       toast.error('Failed to delete course')

//     } finally {
//       setDeleting(false)
//     }
//   }

//   const handleEdit = (e, courseId) => {
//     e.stopPropagation()
//     navigate(`/courses/edit/${courseId}`)
//   }

//   if (loading) return <Loader />

//   const isInstructor = user?.role === 'INSTRUCTOR'

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {isInstructor ? 'My Courses' : 'Browse Courses'}
//           </h1>
//           <p className="text-gray-600">
//             {isInstructor ? 'Manage your courses' : 'Learn and grow your skills'}
//           </p>
//         </div>

//         {isInstructor && (
//           <Button
//             onClick={() => navigate('/courses/create')}
//             variant="primary"
//             icon={Plus}
//           >
//             Create Course
//           </Button>
//         )}
//       </div>

//       {/* No Courses */}
//       {courses.length === 0 ? (
//         <Card className="p-12 text-center">
//           <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses available</h3>
//           <p className="text-gray-600 mb-4">
//             {isInstructor ? 'Create your first course to get started' : 'Check back later for new courses'}
//           </p>

//           {isInstructor && (
//             <Button onClick={() => navigate('/courses/create')} variant="primary">
//               Create Course
//             </Button>
//           )}
//         </Card>
//       ) : (

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

//           {courses.map((course) => {

//             const progress = course.progressPercent ?? 0 // ⭐ correct source

//             return (
//               <Card
//                 key={course.id}
//                 hover
//                 className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
//                 onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'courses' } })}
//               >

//                 {/* Thumbnail */}
//                 <div className="h-48 relative overflow-hidden">
//                   {course.thumbnailUrl ? (
//                     <img
//                       src={course.thumbnailUrl}
//                       alt={course.title}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.target.onerror = null
//                         e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
//                         e.target.parentElement.classList.add(
//                           'bg-gradient-to-br', 'from-blue-400', 'via-purple-500', 'to-pink-500'
//                         )
//                       }}
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
//                       <BookOpen size={64} className="text-white opacity-80" />
//                     </div>
//                   )}

//                   {/* Enrolled Badge */}
//                   {course.isEnrolled && (
//                     <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
//                       Enrolled
//                     </div>
//                   )}

//                   {/* ⭐ Bottom Color Progress Bar (Option A) */}
//                   {course.isEnrolled && (
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
//                       <div className="flex items-center justify-between text-white text-sm mb-1">
//                         <span>Progress</span>
//                         <span>{progress}%</span>
//                       </div>

//                       <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
//                         <div
//                           className="h-full transition-all duration-300"
//                           style={{
//                             width: `${progress}%`,
//                             backgroundColor: getProgressColor(progress)
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Course Info */}
//                 <div className="p-6">

//                   <div className="mb-3 flex items-center justify-between">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       course.difficultyLevel === 'BEGINNER'
//                         ? 'bg-green-100 text-green-800'
//                         : course.difficultyLevel === 'INTERMEDIATE'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {course.difficultyLevel}
//                     </span>

//                     {isInstructor && (
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         course.isPublished
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {course.isPublished ? 'Published' : 'Draft'}
//                       </span>
//                     )}
//                   </div>

//                   <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
//                     {course.title}
//                   </h3>

//                   <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//                     {course.description || 'No description available'}
//                   </p>

//                   {/* Stats */}
//                   <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
//                     <div className="flex items-center space-x-1">
//                       <Users size={16} />
//                       <span>{course.totalEnrollments || 0} students</span>
//                     </div>

//                     <div className="flex items-center space-x-1">
//                       <Clock size={16} />
//                       <span>{course.duration || 0} min</span>
//                     </div>
//                   </div>

//                   <div className="pt-4 border-t">
//                     <p className="text-sm text-gray-600">
//                       By <span className="font-medium text-gray-900">{course.instructorName}</span>
//                     </p>
//                   </div>

//                   {/* Instructor Buttons */}
//                   {isInstructor && (
//                     <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
//                       <Button
//                         onClick={(e) => handleEdit(e, course.id)}
//                         variant="secondary"
//                         size="sm"
//                         icon={Edit}
//                         className="flex-1"
//                       >
//                         Edit
//                       </Button>

//                       <Button
//                         onClick={(e) => handleDelete(e, course)}
//                         variant="danger"
//                         size="sm"
//                         icon={Trash2}
//                         className="flex-1"
//                       >
//                         Delete
//                       </Button>
//                     </div>
//                   )}

//                 </div>

//               </Card>
//             )
//           })}

//         </div>
//       )}

//       {/* Delete Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <Card className="max-w-md w-full mx-4 p-6">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete <strong>"{courseToDelete?.title}"</strong>?  
//               This action cannot be undone.
//             </p>

//             <div className="flex items-center space-x-3">
//               <Button
//                 onClick={confirmDelete}
//                 variant="danger"
//                 className="flex-1"
//                 disabled={deleting}
//               >
//                 {deleting ? 'Deleting...' : 'Delete'}
//               </Button>

//               <Button
//                 onClick={() => setShowDeleteModal(false)}
//                 variant="secondary"
//                 className="flex-1"
//                 disabled={deleting}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </Card>
//         </div>
//       )}

//     </div>
//   )
// }

// export default CourseList

// import React, { useEffect, useState, useMemo } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { courseService } from "../../services/courseService";
// import {
//   BookOpen,
//   Users,
//   Clock,
//   Plus,
//   Edit,
//   Trash2,
//   Search,
// } from "lucide-react";
// import Card from "../common/Card";
// import Loader from "../common/Loader";
// import Button from "../common/Button";
// import Input from "../common/Input";
// import toast from "react-hot-toast";

// // Instructor-focused CourseList with improved UI (Option B)
// const CourseList = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const globalLoading = useSelector((state) => state.course.loading);

//   const isInstructor = user?.role === "INSTRUCTOR";
//   const isAdmin = user?.role === "ADMIN";

//   // Data
//   const [courses, setCourses] = useState([]);

//   // Filters
//   const [search, setSearch] = useState("");
//   const [difficulty, setDifficulty] = useState("");
//   const [duration, setDuration] = useState("");
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [direction, setDirection] = useState("desc");
//   const [published, setPublished] = useState("");
//   const [instructorId, setInstructorId] = useState("");

//   // Admin only
//   const [instructors, setInstructors] = useState([]);

//   // Pagination
//   const [page, setPage] = useState(0);
//   const [size] = useState(6);
//   const [totalPages, setTotalPages] = useState(1);

//   // Delete modal
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [courseToDelete, setCourseToDelete] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // UI: collapsed filters for smaller screens
//   const [filtersOpen, setFiltersOpen] = useState(true);

//   // Local loading for this component (separate from global loader)
//   const [loadingLocal, setLoadingLocal] = useState(false);

//   // Reset page when filter changes
//   useEffect(() => {
//     setPage(0);
//   }, [search, difficulty, duration, sortBy, direction, published, instructorId]);

//   // Load instructor list (Admin)
//   useEffect(() => {
//     if (!isAdmin) return;

//     const load = async () => {
//       try {
//         const res = await courseService.getAllCourses({ page: 0, size: 999 });
//         const wrapper = res?.data ?? {};
//         const pageObj = wrapper.data ?? {};
//         const list = pageObj.content ?? [];

//         const map = {};
//         list.forEach((c) => {
//           if (c.instructorId) map[c.instructorId] = c.instructorName;
//         });

//         const arr = Object.entries(map).map(([id, name]) => ({ id, name }));
//         setInstructors(arr);
//       } catch (err) {
//         console.error("Load instructors error", err);
//       }
//     };

//     load();
//   }, [isAdmin]);

//   // Fetch Courses
//   useEffect(() => {
//     fetchCourses();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, page, search, difficulty, duration, sortBy, direction, published, instructorId]);

//   const fetchCourses = async () => {
//     try {
//       setLoadingLocal(true);

//       // Instructor → Non-paginated (client-side)
//       if (isInstructor) {
//         const list = await courseService.getInstructorCourses(user.userId);
//         // some service variations return wrapper, others return list
//         const arr = Array.isArray(list) ? list : list?.data ?? list?.data?.data ?? [];
//         setCourses(Array.isArray(arr) ? arr : []);
//         setTotalPages(Math.max(1, Math.ceil((arr?.length || 0) / size)));
//         return;
//       }

//       // Student / Admin → Paginated from backend
//       const params = {
//         page,
//         size,
//         sortBy,
//         direction,
//         difficulty: difficulty || null,
//         durationRange: duration || null,
//         search: search || null,
//         studentId: user?.role === "STUDENT" ? user.userId : null,
//         published: isAdmin ? (published === "" ? null : published === "true") : null,
//         instructorId: isAdmin ? (instructorId === "" ? null : Number(instructorId)) : null,
//       };

//       const res = await courseService.getAllCourses(params);
//       const wrapper = res?.data ?? res ?? {};
//       const pageObj = wrapper.data ?? wrapper;

//       const content = pageObj.content ?? pageObj;

//       setCourses(Array.isArray(content) ? content : []);
//       setTotalPages(Math.max(1, pageObj.totalPages ?? 1));
//     } catch (err) {
//       console.error("Course fetch error:", err);
//       toast.error("Failed to load courses");
//       setCourses([]);
//       setTotalPages(1);
//     } finally {
//       setLoadingLocal(false);
//     }
//   };

//   // Instructor Filtering + Pagination (Client Side)
//   const instructorResult = useMemo(() => {
//     if (!isInstructor) {
//       return { paginated: courses, computedTotalPages: totalPages, safePage: page };
//     }

//     let filtered = [...courses];

//     // search
//     if (search) {
//       const q = search.toLowerCase();
//       filtered = filtered.filter(
//         (c) =>
//           c.title.toLowerCase().includes(q) ||
//           (c.description ?? "").toLowerCase().includes(q)
//       );
//     }

//     if (difficulty) {
//       filtered = filtered.filter((c) => c.difficultyLevel === difficulty);
//     }

//     if (duration) {
//       if (duration === "SHORT") filtered = filtered.filter((c) => c.duration < 60);
//       else if (duration === "MEDIUM")
//         filtered = filtered.filter((c) => c.duration >= 60 && c.duration <= 180);
//       else if (duration === "LONG") filtered = filtered.filter((c) => c.duration > 180);
//     }

//     if (published !== "") {
//       const pub = published === "true";
//       filtered = filtered.filter((c) => Boolean(c.isPublished) === pub);
//     }

//     // sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case "title":
//           return direction === "asc"
//             ? a.title.localeCompare(b.title)
//             : b.title.localeCompare(a.title);
//         case "duration":
//           return direction === "asc" ? a.duration - b.duration : b.duration - a.duration;
//         default:
//           return direction === "asc"
//             ? new Date(a.createdAt) - new Date(b.createdAt)
//             : new Date(b.createdAt) - new Date(a.createdAt);
//       }
//     });

//     const computedTotalPages = Math.max(1, Math.ceil(filtered.length / size));
//     const safePage = Math.min(page, computedTotalPages - 1);

//     const paginated = filtered.slice(safePage * size, safePage * size + size);

//     return { paginated, computedTotalPages, safePage };
//   }, [courses, search, difficulty, duration, sortBy, direction, page, published]);

//   useEffect(() => {
//     if (!isInstructor) return;

//     setTotalPages(instructorResult.computedTotalPages);
//     if (page !== instructorResult.safePage) setPage(instructorResult.safePage);
//   }, [instructorResult]);

//   const finalCourses = isInstructor ? instructorResult.paginated : courses;

//   // Delete Functions
//   const handleDelete = (e, course) => {
//     e.stopPropagation();
//     setCourseToDelete(course);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     setDeleting(true);
//     try {
//       await courseService.deleteCourse(courseToDelete.id);
//       toast.success("Course deleted");

//       if (isInstructor) {
//         setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
//       } else {
//         fetchCourses(); // server reload
//       }
//     } catch (err) {
//       toast.error("Delete failed");
//     } finally {
//       setDeleting(false);
//       setShowDeleteModal(false);
//     }
//   };

//   // Pagination UI
//   const renderPagination = () => {
//     if (totalPages <= 1) return null;

//     const pages = [];
//     // show compact pagination window (max 5 pages)
//     const start = Math.max(0, page - 2);
//     const end = Math.min(totalPages - 1, start + 4);

//     for (let i = start; i <= end; i++) {
//       pages.push(
//         <button
//           key={i}
//           onClick={() => setPage(i)}
//           className={`px-3 py-1 rounded-md text-sm font-medium ${
//             page === i ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700"
//           }`}
//         >
//           {i + 1}
//         </button>
//       );
//     }

//     return (
//       <div className="flex items-center justify-center space-x-2 mt-6">
//         <button
//           disabled={page === 0}
//           onClick={() => setPage(Math.max(0, page - 1))}
//           className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40"
//         >
//           Prev
//         </button>

//         {pages}

//         <button
//           disabled={page === totalPages - 1}
//           onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
//           className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40"
//         >
//           Next
//         </button>
//       </div>
//     );
//   };

//   const getProgressColor = (p) => (p < 30 ? "#ef4444" : p < 70 ? "#facc15" : "#22c55e");

//   const isLoading = globalLoading || loadingLocal;

//   // small skeleton card used while loading
//   const SkeletonCard = () => (
//     <div className="animate-pulse space-y-3">
//       <div className="h-44 bg-gray-200 rounded-md" />
//       <div className="h-4 bg-gray-200 rounded w-3/4" />
//       <div className="h-3 bg-gray-200 rounded w-1/2" />
//       <div className="flex justify-between pt-2">
//         <div className="h-8 w-24 bg-gray-200 rounded" />
//         <div className="h-8 w-16 bg-gray-200 rounded" />
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* HEADER */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {isInstructor ? "My Courses" : isAdmin ? "All Courses" : "Browse Courses"}
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">Find, filter and manage courses quickly</p>
//         </div>

//         <div className="flex items-center space-x-3">
//           <button
//             onClick={() => setFiltersOpen((s) => !s)}
//             className="hidden md:inline-flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:shadow"
//           >
//             <Search size={16} />
//             <span className="text-sm">Filters</span>
//           </button>

//           {isInstructor && (
//             <Button onClick={() => navigate("/courses/create")} variant="primary" icon={Plus}>
//               Create Course
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* FILTER BAR (collapsible on small screens) */}
//       <div className={`bg-white p-4 rounded-lg shadow mb-6 transition-all ${filtersOpen ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
//           {/* Search */}
//           <div className="col-span-1 flex items-center space-x-2">
//             <Search size={18} />
//             <Input
//               placeholder="Search courses..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full"
//             />
//           </div>

//           {/* Difficulty */}
//           <select
//             value={difficulty}
//             onChange={(e) => setDifficulty(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">All Difficulty</option>
//             <option value="BEGINNER">Beginner</option>
//             <option value="INTERMEDIATE">Intermediate</option>
//             <option value="ADVANCED">Advanced</option>
//           </select>

//           {/* Duration */}
//           <select value={duration} onChange={(e) => setDuration(e.target.value)} className="border p-2 rounded">
//             <option value="">All Durations</option>
//             <option value="SHORT">Short (&lt; 60 mins)</option>
//             <option value="MEDIUM">Medium (60–180 mins)</option>
//             <option value="LONG">Long (&gt; 180 mins)</option>
//           </select>

//           {/* Sort */}
//           <select
//             value={`${sortBy}-${direction}`}
//             onChange={(e) => {
//               const [s, d] = e.target.value.split("-");
//               setSortBy(s);
//               setDirection(d);
//             }}
//             className="border p-2 rounded"
//           >
//             <option value="createdAt-desc">Newest</option>
//             <option value="createdAt-asc">Oldest</option>
//             <option value="title-asc">A → Z</option>
//             <option value="duration-asc">Duration</option>
//           </select>

//           {/* Admin/Instructor status */}
//           <div className="flex items-center space-x-2">
//             {isAdmin && (
//               <select value={published} onChange={(e) => setPublished(e.target.value)} className="border p-2 rounded">
//                 <option value="">All Status</option>
//                 <option value="true">Published</option>
//                 <option value="false">Draft</option>
//               </select>
//             )}

//             {isAdmin && (
//               <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className="border p-2 rounded">
//                 <option value="">All Instructors</option>
//                 {instructors.map((i) => (
//                   <option key={i.id} value={i.id}>{i.name}</option>
//                 ))}
//               </select>
//             )}

//             {isInstructor && (
//               <select value={published} onChange={(e) => setPublished(e.target.value)} className="border p-2 rounded">
//                 <option value="">All Status</option>
//                 <option value="true">Published</option>
//                 <option value="false">Draft</option>
//               </select>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* COURSE LIST */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: size }).map((_, idx) => (
//             <Card key={idx} className="p-4">
//               <SkeletonCard />
//             </Card>
//           ))}
//         </div>
//       ) : finalCourses.length === 0 ? (
//         <Card className="p-10 text-center">
//           <BookOpen size={60} className="mx-auto text-gray-400" />
//           <h3 className="text-xl font-semibold mt-3 text-gray-700">No Courses Found</h3>
//           <p className="text-sm text-gray-500 mt-2">Try clearing filters or create a new course.</p>
//         </Card>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {finalCourses.map((course) => {
//               const progress = course.progressPercent ?? 0;

//               return (
//                 <Card
//                   key={course.id}
//                   hover
//                   className="cursor-pointer hover:scale-[1.02] transform-gpu transition-shadow duration-200"
//                   onClick={() => navigate(`/courses/${course.id}`, { state: { from: "courses" } })}
//                 >
//                   {/* Thumbnail */}
//                   <div className="h-48 relative overflow-hidden rounded-t-md">
//                     {course.thumbnailUrl ? (
//                       <img
//                         src={course.thumbnailUrl}
//                         alt={course.title}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
//                         <BookOpen size={64} className="text-white opacity-90" />
//                       </div>
//                     )}

//                     {/* Enrolled Badge & Progress */}
//                     {course.isEnrolled && (
//                       <>
//                         <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs shadow">Enrolled</div>

//                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
//                           <div className="flex justify-between text-white text-sm mb-1">
//                             <span>Progress</span>
//                             <span>{progress}%</span>
//                           </div>
//                           <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
//                             <div
//                               className="h-full transition-all duration-300"
//                               style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }}
//                             />
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   {/* Card Body */}
//                   <div className="p-5">
//                     <div className="mb-3 flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           course.difficultyLevel === "BEGINNER" ? "bg-green-100 text-green-700" :
//                           course.difficultyLevel === "INTERMEDIATE" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
//                         }`}>{course.difficultyLevel}</span>

//                         {isInstructor && (
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
//                             {course.isPublished ? "Published" : "Draft"}
//                           </span>
//                         )}
//                       </div>

//                       <div className="text-sm text-gray-500">
//                         <div className="flex items-center gap-4">
//                           <div className="flex items-center space-x-1">
//                             <Users size={14} />
//                             <span>{course.totalEnrollments || 0}</span>
//                           </div>
//                           <div className="flex items-center space-x-1">
//                             <Clock size={14} />
//                             <span>{course.duration || 0}m</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
//                     <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>

//                     <div className="mt-4 pt-4 border-t flex items-center justify-between">
//                       <p className="text-sm text-gray-700">By <span className="font-medium">{course.instructorName}</span></p>

//                       {isInstructor ? (
//                         <div className="flex gap-2 w-48">
//                           <Button onClick={(e) => { e.stopPropagation(); navigate(`/courses/edit/${course.id}`); }} size="sm" variant="secondary" icon={Edit} className="flex-1">Edit</Button>
//                           <Button onClick={(e) => { e.stopPropagation(); handleDelete(e, course); }} size="sm" variant="danger" icon={Trash2} className="flex-1">Delete</Button>
//                         </div>
//                       ) : (
//                         <div className="flex gap-2">
//                           <Button onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`, { state: { from: 'courses' } }); }} size="sm" variant="secondary">View</Button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </Card>
//               );
//             })}
//           </div>

// <<<<<<< HEAD
//           {renderPagination()}
//         </>
// =======
//                   <div className="pt-4 border-t">
//                     <p className="text-sm text-gray-600">
//                       By <span className="font-medium text-gray-900">{course.instructorName}</span>
//                     </p>
//                   </div>

//                   {/* Student Buttons */}
//                   {!isInstructor && (
//                     <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
//                       <Button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           navigate(`/courses/${course.id}`, { state: { from: 'courses' } })
//                         }}
//                         variant="secondary"
//                         size="sm"
//                         className="flex-1"
//                       >
//                         View Details
//                       </Button>

//                       {!course.isEnrolled && (
//                         <Button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             navigate(`/courses/${course.id}`, { state: { from: 'courses' } })
//                           }}
//                           variant="primary"
//                           size="sm"
//                           className="flex-1"
//                         >
//                           Enroll Now
//                         </Button>
//                       )}
//                     </div>
//                   )}

//                   {/* Instructor Buttons */}
//                   {isInstructor && (
//                     <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
//                       <Button
//                         onClick={(e) => handleEdit(e, course.id)}
//                         variant="secondary"
//                         size="sm"
//                         icon={Edit}
//                         className="flex-1"
//                       >
//                         Edit
//                       </Button>

//                       <Button
//                         onClick={(e) => handleDelete(e, course)}
//                         variant="danger"
//                         size="sm"
//                         icon={Trash2}
//                         className="flex-1"
//                       >
//                         Delete
//                       </Button>
//                     </div>
//                   )}

//                 </div>

//               </Card>
//             )
//           })}

//         </div>
// >>>>>>> 2a61569c70cee546b1d68a64635585cd377ee25a
//       )}

//       {/* DELETE MODAL */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <Card className="p-6 w-full max-w-md">
//             <h3 className="text-xl font-bold mb-3">Confirm Delete</h3>
//             <p className="mb-6 text-gray-600">Are you sure you want to delete <strong>{courseToDelete?.title}</strong>? This action cannot be undone.</p>

//             <div className="flex gap-3">
//               <Button variant="danger" className="flex-1" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
//               <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
//             </div>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CourseList;


// src/components/course/CourseList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import {
  BookOpen,
  Users,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Share2,
  Eye,
  Tag,
  Columns3,
  IndianRupee,
  Lock,
} from "lucide-react";

import Card from "../common/Card";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Input from "../common/Input";
import toast from "react-hot-toast";
import KanbanView from "./KanbanView";

// Hybrid CourseList — merges your feature-rich logic with teammate's stable card layout
// - Instructor: client-side filtering + pagination
// - Student/Admin: server-side paginated
// - Robust handling of service response shapes
// - Improved UI width/spacing to match StudentDashboard

const CourseList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const globalLoading = useSelector((state) => state.course?.loading);

  const isInstructor = user?.role === "INSTRUCTOR";
  const isAdmin = user?.role === "ADMIN";

  // Data
  const [courses, setCourses] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [published, setPublished] = useState("");
  const [instructorId, setInstructorId] = useState("");

  // Admin only
  const [instructors, setInstructors] = useState([]);

  // Pagination (server-side for student/admin, client-side for instructor)
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // UI helpers
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // reset page on filters change
  useEffect(() => {
    setPage(0);
  }, [search, difficulty, duration, sortBy, direction, published, instructorId]);

  // Load instructors list for admin filter
  useEffect(() => {
    if (!isAdmin) return;

    const load = async () => {
      try {
        const res = await courseService.getAllCourses({ page: 0, size: 999 });
        // service might return response, or response.data, or wrapper.data.data
        const wrapper = res?.data ?? res ?? {};
        const pageObj = wrapper.data ?? wrapper;
        const list = pageObj.content ?? pageObj ?? [];

        const map = {};
        list.forEach((c) => {
          if (c.instructorId) map[c.instructorId] = c.instructorName;
        });

        const arr = Object.entries(map).map(([id, name]) => ({ id, name }));
        setInstructors(arr);
      } catch (err) {
        console.error("Load instructors error", err);
      }
    };

    load();
  }, [isAdmin]);

  // fetch courses whenever dependencies change
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, search, difficulty, duration, sortBy, direction, published, instructorId]);

  const fetchCourses = async () => {
    try {
      setLoadingLocal(true);

      // Instructor: fetch all instructor courses and paginate client-side
      if (isInstructor) {
        const listResp = await courseService.getInstructorCourses(user.userId);
        // normalize various shapes
        const arr = Array.isArray(listResp)
          ? listResp
          : listResp?.data ?? listResp?.data?.data ?? [];

        const finalArr = Array.isArray(arr) ? arr : [];
        setCourses(finalArr);
        setTotalPages(Math.max(1, Math.ceil((finalArr?.length || 0) / size)));

        return;
      }

      // Student / Admin: server paginated
      const params = {
        page,
        size,
        sortBy,
        direction,
        difficulty: difficulty || null,
        durationRange: duration || null,
        search: search || null,
        studentId: user?.role === "STUDENT" ? user.userId : null,
        published: isAdmin ? (published === "" ? null : published === "true") : null,
        instructorId: isAdmin ? (instructorId === "" ? null : Number(instructorId)) : null,
      };

      const res = await courseService.getAllCourses(params);
      const wrapper = res?.data ?? res ?? {};
      const pageObj = wrapper.data ?? wrapper;
      const content = pageObj.content ?? pageObj ?? [];

      setCourses(Array.isArray(content) ? content : []);
      setTotalPages(Math.max(1, pageObj.totalPages ?? 1));
    } catch (err) {
      console.error("Course fetch error:", err);
      toast.error("Failed to load courses");
      setCourses([]);
      setTotalPages(1);
    } finally {
      setLoadingLocal(false);
    }
  };

  // Client-side (instructor) filtering + pagination
  const instructorResult = useMemo(() => {
    if (!isInstructor) return { paginated: courses, computedTotalPages: totalPages, safePage: page };

    let filtered = [...courses];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) => c.title.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q)
      );
    }

    if (difficulty) filtered = filtered.filter((c) => c.difficultyLevel === difficulty);

    if (duration) {
      if (duration === "SHORT") filtered = filtered.filter((c) => c.duration < 60);
      else if (duration === "MEDIUM") filtered = filtered.filter((c) => c.duration >= 60 && c.duration <= 180);
      else if (duration === "LONG") filtered = filtered.filter((c) => c.duration > 180);
    }

    if (published !== "") {
      const pub = published === "true";
      filtered = filtered.filter((c) => Boolean(c.isPublished) === pub);
    }

    // sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        case "duration":
          return direction === "asc" ? a.duration - b.duration : b.duration - a.duration;
        default:
          return direction === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    const computedTotalPages = Math.max(1, Math.ceil(filtered.length / size));
    const safePage = Math.min(page, computedTotalPages - 1);
    const paginated = filtered.slice(safePage * size, safePage * size + size);

    return { paginated, computedTotalPages, safePage };
  }, [courses, search, difficulty, duration, sortBy, direction, page, published]);

  useEffect(() => {
    if (!isInstructor) return;
    setTotalPages(instructorResult.computedTotalPages);
    if (page !== instructorResult.safePage) setPage(instructorResult.safePage);
  }, [instructorResult]);

  const finalCourses = isInstructor ? instructorResult.paginated : courses;

  // Delete flow
  const handleDelete = (e, course) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // Share course link
  const handleShare = (e, course) => {
    e.stopPropagation();
    const courseUrl = `${window.location.origin}/courses/${course.id}`;
    navigator.clipboard.writeText(courseUrl).then(() => {
      toast.success('Course link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Handle enroll click - redirect to login if not authenticated
  const handleEnrollClick = (e, courseId) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to enroll in this course');
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }

    // If authenticated, navigate to course detail page
    navigate(`/courses/${courseId}`, { state: { from: 'courses' } });
  };

  // Parse tags from comma-separated string
  const parseTags = (tagsString) => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  // const confirmDelete = async () => {
  //   if (!courseToDelete) return;
  //   setDeleting(true);
  //   try {
  //     await courseService.deleteCourse(courseToDelete.id);
  //     toast.success("Course deleted");

  //     if (isInstructor) setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
  //     else fetchCourses();
  //   } catch (err) {
  //     console.error("Delete failed", err);
  //     toast.error("Delete failed");
  //   } finally {
  //     setDeleting(false);
  //     setShowDeleteModal(false);
  //   }
  // };


  const confirmDelete = async () => {
    if (!courseToDelete) return;

    setDeleting(true);

    try {
      const res = await courseService.deleteCourse(courseToDelete.id);

      // ✅ Validate backend success flag
      if (res?.success === false) {
        throw new Error(res?.message || "Delete failed");
      }

      toast.success("Course deleted successfully");

      // Update UI
      if (isInstructor) {
        setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      } else {
        fetchCourses();
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(err.message || "Failed to delete course");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };


  // Pagination UI (compact window)
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(0, page - 2);
    const end = Math.min(totalPages - 1, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${page === i ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700"
            }`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          disabled={page === 0}
          onClick={() => setPage(Math.max(0, page - 1))}
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>

        {pages}

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  const getProgressColor = (p) => (p < 30 ? "#ef4444" : p < 70 ? "#facc15" : "#22c55e");

  const isLoading = globalLoading || loadingLocal;

  // Skeleton
  const SkeletonCard = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-44 bg-gray-200 rounded-md" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between pt-2">
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8"> {/* px aligns with StudentDashboard */}
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isInstructor ? "My Courses" : isAdmin ? "All Courses" : "Browse Courses"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Find, filter and manage courses quickly</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all duration-200 ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              title="List View"
            >
              <ListIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-all duration-200 ${viewMode === "kanban" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              title="Kanban View"
            >
              <Columns3 size={18} />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchCourses}
            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Refresh Courses"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          {isInstructor && (
            <Button onClick={() => navigate("/courses/create")} variant="primary" icon={Plus}>
              Create Course
            </Button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-[2] min-w-[240px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Difficulty */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="">All Difficulty</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {/* Duration */}
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="">All Durations</option>
            <option value="SHORT">Short (&lt; 60m)</option>
            <option value="MEDIUM">Medium (1-3h)</option>
            <option value="LONG">Long (&gt; 3h)</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${direction}`}
            onChange={(e) => {
              const [s, d] = e.target.value.split("-");
              setSortBy(s);
              setDirection(d);
            }}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="createdAt-desc">Newest</option>
            <option value="createdAt-asc">Oldest</option>
            <option value="title-asc">A → Z</option>
            <option value="duration-asc">Duration</option>
          </select>

          {/* Admin / Instructor status & instructors */}
          {(isAdmin || isInstructor) && (
            <select
              value={published}
              onChange={(e) => setPublished(e.target.value)}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white transition-colors"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          )}

          {isAdmin && (
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="flex-1 min-w-[140px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-white transition-colors"
            >
              <option value="">All Instructors</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* COURSE LIST */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: size }).map((_, idx) => (
            <Card key={idx} className="p-4">
              <SkeletonCard />
            </Card>
          ))}
        </div>
      ) : finalCourses.length === 0 ? (
        <Card className="p-10 text-center">
          <BookOpen size={60} className="mx-auto text-gray-400" />
          <h3 className="text-xl font-semibold mt-3 text-gray-700">No Courses Found</h3>
          <p className="text-sm text-gray-500 mt-2">Try clearing filters or create a new course.</p>
        </Card>
      ) : viewMode === "kanban" ? (
        <>
          <KanbanView
            courses={finalCourses}
            isInstructor={isInstructor}
            onDelete={handleDelete}
            onShare={handleShare}
            parseTags={parseTags}
            onCourseUpdate={fetchCourses}
          />
        </>
      ) : (
        <>
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {finalCourses.map((course) => {
              const progress = course.progressPercent ?? 0;

              // -------------------------------------------
              // LIST VIEW (Horizontal)
              // -------------------------------------------
              if (viewMode === "list") {
                return (
                  <Card
                    key={course.id}
                    hover
                    className="cursor-pointer transform hover:scale-[1.01] transition-transform duration-200 flex flex-col md:flex-row overflow-hidden"
                    onClick={() => navigate(`/courses/${course.id}`, { state: { from: "courses" } })}
                  >
                    {/* Thumbnail Section */}
                    <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                            e.target.parentElement.classList.add(
                              'bg-gradient-to-br', 'from-blue-400', 'via-purple-500', 'to-pink-500'
                            );
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                          <BookOpen size={64} className="text-white opacity-80" />
                        </div>
                      )}

                      {/* Enrolled Badge & Progress */}
                      {course.isEnrolled && (
                        <>
                          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">Enrolled</div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <div className="flex items-center justify-between text-white text-xs mb-1">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                              <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${course.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                            course.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>{course.difficultyLevel}</span>

                          {/* Price Badge */}
                          <div className="ml-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${course.accessRule === 'ON_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                              course.accessRule === 'ON_INVITATION' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {course.accessRule === 'ON_PAYMENT' ? `₹${course.price?.toFixed(2)}` :
                                course.accessRule === 'ON_INVITATION' ? 'Invite Only' : 'Free'}
                            </span>
                          </div>

                          {isInstructor && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-500 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{course.totalEnrollments || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{course.duration || 0}m</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>

                      {/* Tags */}
                      {course.tags && parseTags(course.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {parseTags(course.tags).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 line-clamp-4 mb-4 flex-1">{course.description}</p>

                      {/* Stats Row */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <BookOpen size={14} />
                          <span>{course.totalTopics || 0} Lessons</span>
                        </div>
                        {course.viewsCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{course.viewsCount || 0} views</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t flex items-center justify-between mt-auto">
                        <p className="text-sm text-gray-700">By <span className="font-medium">{course.instructorName}</span></p>

                        <div className="flex items-center gap-2">
                          {isInstructor ? (
                            <>
                              <Button onClick={(e) => handleShare(e, course)} size="sm" variant="secondary" icon={Share2} title="Share course"></Button>
                              <Button onClick={(e) => { e.stopPropagation(); navigate(`/courses/edit/${course.id}`); }} size="sm" variant="secondary" icon={Edit}>Edit</Button>
                              <Button onClick={(e) => { e.stopPropagation(); handleDelete(e, course); }} size="sm" variant="danger" icon={Trash2}>Delete</Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={(e) => handleShare(e, course)} size="sm" variant="secondary" icon={Share2} title="Share course"></Button>
                              <Button onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`, { state: { from: 'courses' } }); }} size="sm" variant="secondary">View Details</Button>
                              {!course.isEnrolled && (user?.role === 'STUDENT' || !isAuthenticated) && (
                                <Button
                                  onClick={(e) => handleEnrollClick(e, course.id)}
                                  variant={course.accessRule === 'ON_PAYMENT' ? "warning" : "primary"}
                                  size="sm"
                                  icon={course.accessRule === 'ON_INVITATION' ? Lock : (course.accessRule === 'ON_PAYMENT' ? IndianRupee : null)}
                                >
                                  {course.accessRule === 'ON_PAYMENT' ? `₹${course.price?.toFixed(2)}` :
                                    course.accessRule === 'ON_INVITATION' ? 'Request' : 'Enroll'}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              }

              // -------------------------------------------
              // GRID VIEW (Vertical) - Existing Logic
              // -------------------------------------------
              return (
                <Card
                  key={course.id}
                  hover
                  className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  onClick={() => navigate(`/courses/${course.id}`, { state: { from: "courses" } })}
                >
                  {/* Thumbnail */}
                  <div className="h-48 relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                          e.target.parentElement.classList.add(
                            'bg-gradient-to-br', 'from-blue-400', 'via-purple-500', 'to-pink-500'
                          );
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                        <BookOpen size={64} className="text-white opacity-80" />
                      </div>
                    )}

                    {/* Enrolled Badge & Progress */}
                    {course.isEnrolled && (
                      <>
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">Enrolled</div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="flex items-center justify-between text-white text-sm mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>

                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: getProgressColor(progress) }} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                          course.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>{course.difficultyLevel}</span>

                        {isInstructor && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{course.totalEnrollments || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{course.duration || 0}m</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{course.title}</h3>

                    {/* Tags */}
                    {course.tags && parseTags(course.tags).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {parseTags(course.tags).map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{course.totalTopics || 0} Lessons</span>
                      </div>
                      {course.viewsCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{course.viewsCount || 0} views</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <p className="text-sm text-gray-700">By <span className="font-medium">{course.instructorName}</span></p>

                      {isInstructor ? (
                        <div className="flex gap-2">
                          <Button onClick={(e) => handleShare(e, course)} size="sm" variant="secondary" icon={Share2} title="Share course"></Button>
                          <Button onClick={(e) => { e.stopPropagation(); navigate(`/courses/edit/${course.id}`); }} size="sm" variant="secondary" icon={Edit}>Edit</Button>
                          <Button onClick={(e) => { e.stopPropagation(); handleDelete(e, course); }} size="sm" variant="danger" icon={Trash2}>Delete</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={(e) => handleShare(e, course)} size="sm" variant="secondary" icon={Share2} title="Share course"></Button>
                          <Button onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`, { state: { from: 'courses' } }); }} size="sm" variant="secondary">View Details</Button>

                          {!course.isEnrolled && (user?.role === 'STUDENT' || !isAuthenticated) && (
                            <Button onClick={(e) => handleEnrollClick(e, course.id)} variant="primary" size="sm">Enroll Now</Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {renderPagination()}
        </>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-3">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete <strong>{courseToDelete?.title}</strong>? This action cannot be undone.</p>

            <div className="flex gap-3">
              {/* <Button variant="danger" className="flex-1" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button> */}
              <Button
                variant="danger"
                className="flex-1"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>

              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}


    </div>
  );
};

export default CourseList;

// src/components/dashboard/StudentDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  AlertTriangle,
} from "lucide-react";

import { courseService } from "../../services/courseService";
import { adaptiveService } from "../../services/adaptiveService";
import { progressService } from "../../services/progressService";
import { enrollmentService } from "../../services/enrollmentService";
import { topicService } from "../../services/topicService";

import Card from "../common/Card";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Modal from "../common/Modal";
import DashboardOverview from "./DashboardOverview";
import toast from "react-hot-toast";
import ProgressTracker from "../progress/ProgressTracker";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // progress + lastAccessed
  const [nextSuggestion, setNextSuggestion] = useState(null);
  const [suggestedCourseId, setSuggestedCourseId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unenroll Modal State
  const [unenrollModalOpen, setUnenrollModalOpen] = useState(false);
  const [courseToUnenroll, setCourseToUnenroll] = useState(null);

  // Carousel refs + state (declared early so helpers can use them)
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // layout constants
  const CARD_WIDTH = 360; // px (including any margins/gap)
  const VISIBLE_COUNT = 3; // how many cards visible at once
  const GAP = 24; // px gap between cards

  // ----------------- Helper functions (declared BEFORE useEffect to avoid ref errors) -----------------
  const getProgress = (courseId) => {
    const p = enrollments.find((e) => Number(e.courseId) === Number(courseId));
    const progress = p?.completionPercentage ?? p?.progressPercent ?? 0;
    // Debug logging
    if (courseId && !p) {
      console.log('⚠️ No progress found for courseId:', courseId, 'Available enrollments:', enrollments.map(e => ({ courseId: e.courseId, progress: e.completionPercentage })));
    }
    return progress;
  };

  const getLastAccessed = (courseId) => {
    const p = enrollments.find((e) => e.courseId === courseId);
    return p?.lastAccessed ?? p?.lastAccessedAt ?? p?.lastUpdated ?? null;
  };

  const getProgressColor = (percent) => {
    if (percent < 30) return "#ef4444";
    if (percent < 70) return "#facc15";
    return "#22c55e";
  };

  const handleEnroll = async (e, courseId, courseTitle) => {
    e.stopPropagation();
    try {
      await enrollmentService.enrollCourse(user.userId, courseId);
      toast.success(`Enrolled in ${courseTitle}!`);
      loadDashboard(); // Reload to show updated enrollment
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const initiateUnenroll = (e, course) => {
    e.stopPropagation();
    setCourseToUnenroll(course);
    setUnenrollModalOpen(true);
  };

  const confirmUnenroll = async () => {
    if (!courseToUnenroll) return;

    try {
      await enrollmentService.unenrollCourse(user.userId, courseToUnenroll.id);
      toast.success('Unenrolled successfully!');
      loadDashboard(); // Reload to show updated enrollment
      setUnenrollModalOpen(false);
      setCourseToUnenroll(null);
    } catch (error) {
      console.error('Unenroll failed:', error);
      toast.error('Failed to unenroll');
    }
  };

  const getCollection = () => (sortedEnrolled.length === 0 ? popularCourses : sortedEnrolled);

  // update arrows visibility and slideIndex based on scroll position
  const updateArrows = () => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < Math.max(0, maxScrollLeft - 10));
    // compute slideIndex as nearest item index at left (approx)
    const idx = Math.round(el.scrollLeft / (CARD_WIDTH + GAP));
    setSlideIndex(Math.max(0, idx));
  };

  const scrollByCards = (count) => {
    const el = carouselRef.current;
    if (!el) return;
    const step = (CARD_WIDTH + GAP) * count;
    el.scrollBy({ left: step, behavior: "smooth" });
    // schedule update after animation
    setTimeout(updateArrows, 310);
  };

  const handleScroll = () => {
    updateArrows();
  };

  // ----------------- Data loader (declared before useEffect) -----------------
  const loadDashboard = async () => {
    try {
      setLoading(true);

      // 1) Fetch all published courses
      const res = await courseService.getPublishedCourses(user?.userId);
      const courseList = res?.data?.data ?? res?.data ?? [];
      console.log('📚 Fetched Courses:', courseList.map(c => ({ id: c.id, title: c.title, isEnrolled: c.isEnrolled })));
      setCourses(Array.isArray(courseList) ? courseList : []);

      // 2) Fetch student progress (contains lastAccessed)
      let progressList = [];
      if (user?.studentId) {
        const progResp = await progressService.getStudentProgress(user.studentId);
        progressList = progResp?.data?.data ?? progResp?.data ?? [];
        console.log('📊 Progress API Response:', progResp);
        console.log('📊 Extracted Progress List:', progressList);
        setEnrollments(Array.isArray(progressList) ? progressList : []);
      } else {
        console.error('No studentId found for user:', user);
        setEnrollments([]);
      }

      // 3) AI Suggested Topic — using MOST RECENTLY ACCESSED COURSE
      const enrolledCourses = courseList.filter((c) => c.isEnrolled);

      if (enrolledCourses.length > 0 && progressList.length > 0) {

        // sort progress by lastAccessed DESC
        const sortedProgress = [...progressList].sort((a, b) => {
          const dateA = new Date(a.lastAccessed || 0).getTime();
          const dateB = new Date(b.lastAccessed || 0).getTime();
          return dateB - dateA;
        });

        // pick the most recently accessed courseId
        const recentCourseId = sortedProgress[0]?.courseId;

        if (recentCourseId) {
          setSuggestedCourseId(recentCourseId);

          // call adaptive API
          try {
            const progressVal = getProgress(recentCourseId);

            // 4) Logic Update: If Course is 100% completed, prioritize "NEXT COURSE" suggestion
            //    Check this FIRST, before asking for adaptive topic (which implies continuing current course)
            let foundNextCourse = false;

            if (progressVal >= 100) {
              try {
                const nextCourseResp = await courseService.getNextCourseRecommendation(recentCourseId, user?.studentId);
                const nextCourse = nextCourseResp?.data?.data ?? nextCourseResp?.data;

                if (nextCourse && nextCourse.id) {
                  // 2. Get First Topic of Next Course
                  const topics = await topicService.getTopicsByCourse(nextCourse.id);

                  if (topics && topics.length > 0) {
                    const firstTopic = topics.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))[0];

                    setNextSuggestion({
                      id: firstTopic.id,
                      name: firstTopic.name,
                      description: firstTopic.description,
                      itemsCount: firstTopic.materialsCount,
                      courseId: nextCourse.id,
                      courseTitle: nextCourse.title,
                      recommendationType: 'NEXT_COURSE',
                      recommendationReason: `You've mastered the previous course! Ready to start ${nextCourse.title}?`
                    });
                    setSuggestedCourseId(nextCourse.id);
                    foundNextCourse = true;
                  }
                }
              } catch (nextErr) {
                console.error("Failed to load next course suggestion:", nextErr);
              }
            }

            // 5) If NOT 100% completed, OR if Next Course lookup failed, try standard Adaptive Topic
            if (!foundNextCourse) {
              const suggestionResp = await adaptiveService.getNextTopic(
                user?.studentId,
                recentCourseId
              );
              const topic = suggestionResp?.data?.data ?? suggestionResp?.data ?? null;

              if (topic) {
                setNextSuggestion(topic);
                // Ensure we point to the current course for adaptive topics
                // (unless topic has its own courseId, which is rare for adaptive DTO)
                if (!topic.courseId) {
                  setSuggestedCourseId(recentCourseId);
                }
              } else {
                setNextSuggestion(null);
              }
            }

          } catch (adaptiveErr) {
            console.error("Failed to load adaptive suggestion:", adaptiveErr);
            // Don't show error to user - AI suggestion is optional
          }
        }
      }

      // update arrows
      setTimeout(updateArrows, 60);

    } catch (err) {
      console.error("Failed to load dashboard:", err);
      toast.error("Failed to load dashboard");
      setCourses([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Effects -----------------
  useEffect(() => {
    loadDashboard();
    // attach resize listener to update arrows when viewport changes
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // after courses/enrollments change, recalc arrows
    setTimeout(updateArrows, 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, enrollments]);

  if (loading) return <Loader />;

  // --- Filter enrolled + sort by last accessed (most recent first)
  const enrolledCourses = courses.filter((c) => !!c.isEnrolled);

  const sortedEnrolled = [...enrolledCourses].sort((a, b) => {
    const A = new Date(getLastAccessed(a.id) || 0).getTime();
    const B = new Date(getLastAccessed(b.id) || 0).getTime();
    return B - A;
  });

  // Stats
  const completed = sortedEnrolled.filter((c) => getProgress(c?.id) === 100);
  const inProgress = sortedEnrolled.filter(
    (c) => getProgress(c?.id) > 0 && getProgress(c?.id) < 100
  );

  const stats = [
    { label: "Enrolled", value: sortedEnrolled.length, icon: BookOpen, color: "from-blue-500 to-blue-600" },
    { label: "Completed", value: completed.length, icon: Award, color: "from-green-500 to-green-600" },
    { label: "In Progress", value: inProgress.length, icon: TrendingUp, color: "from-yellow-500 to-yellow-600" },
    { label: "Available", value: courses.length, icon: Clock, color: "from-purple-500 to-purple-600" },
  ];

  const popularCourses = [...courses]
    .sort((a, b) => (b.totalEnrollments || 0) - (a.totalEnrollments || 0))
    .slice(0, 6);

  // center card index: first visible index + middle offset
  const centerIndex = slideIndex + Math.floor(VISIBLE_COUNT / 2);

  // arrow visuals
  const arrowBtnBase =
    "absolute top-1/2 -translate-y-1/2 z-30 p-3 rounded-full shadow-lg flex items-center justify-center";

  //  const arrowCircleStyle =
  // "w-12 h-12 bg-white/80 backdrop-blur-md shadow-xl ring-1 ring-white/40 flex items-center justify-center rounded-full";
  const arrowCircleStyle =
    "w-12 h-12 bg-white shadow-lg ring-1 ring-black/10 flex items-center justify-center rounded-full";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, <span className="text-blue-600">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-6 rounded-2xl shadow bg-white border hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">{item.label}</p>
                  <p className="text-3xl font-bold mt-1">{item.value}</p>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color}`}>
                  <Icon className="text-white" size={26} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendation */}
      {nextSuggestion && (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 p-[2px] rounded-2xl shadow-xl mb-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8">

            {/* Header */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="bg-indigo-100 text-indigo-600 p-4 rounded-xl">
                <Sparkles size={32} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Next Suggested Topic For You
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Based on your learning pattern & progress
                </p>
              </div>
            </div>

            {/* Topic Details Box */}
            <div className="mt-4 bg-white/60 backdrop-blur-md border border-white/40 shadow-md rounded-xl p-6">

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded text-white ${nextSuggestion.recommendationType === 'REVISION' ? 'bg-red-500' : 'bg-blue-500'}`}>
                  {nextSuggestion.recommendationType || "ADAPTIVE"}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                {nextSuggestion?.name}
              </h3>

              <p className="text-gray-600 mt-2 text-sm italic">
                "{nextSuggestion?.recommendationReason || nextSuggestion?.description || "Recommended based on your progress."}"
              </p>

              <div className="mt-5">
                <button
                  onClick={() => {
                    const cid =
                      nextSuggestion?.courseId ??
                      suggestedCourseId ??
                      nextSuggestion?.course?.id;

                    if (!cid) {
                      toast.error("Course ID not available.");
                      return;
                    }

                    navigate(`/courses/${cid}`, {
                      state: {
                        recommendedTopicId: nextSuggestion?.id,
                        forceReload: Date.now(),
                      },
                    });
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow text-sm font-medium flex items-center space-x-2"
                >
                  <span>Go to Topic</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Dashboard Overview - Performance across all activities */}
      <div className="mb-10">
        <DashboardOverview />
      </div>

      {/* Progress Section */}
      <ProgressTracker />

      {/* Courses Section header */}
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {sortedEnrolled.length > 0 ? "Recently Accessed" : "Recommended For You"}
        </h2>

        <Button onClick={() => navigate("/courses")} variant="outline">
          View All
        </Button>
      </div>

      {/* ---- NETFLIX STYLE CAROUSEL (3 visible cards) ---- */}
      <div className="relative">
        {/* Left arrow - shows only when we can scroll left */}
        {canScrollLeft && (
          <button
            aria-label="Scroll left"
            onClick={() => scrollByCards(-1)}
            className={`${arrowBtnBase} left-0 -ml-10 hidden md:flex`}
            style={{ transform: "translateY(-50%)" }}
          >
            <div className={`${arrowCircleStyle}`}>
              <ChevronLeft size={20} className="text-blue-600" />
            </div>
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={carouselRef}
          id="courseCarousel"
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {/* hide scrollbar for webkit browsers */}
          <style>{`
            #courseCarousel::-webkit-scrollbar { display: none; height: 8px; }
          `}</style>

          {(sortedEnrolled.length === 0 ? popularCourses : sortedEnrolled)
            .slice(0, 20)
            .map((course, idx) => {
              const progressVal = getProgress(course.id);
              const overallIndex = idx;
              const isCenter = overallIndex === centerIndex;
              const scale = isCenter ? 1.03 : 1.0;

              return (

                <div
                  key={course.id}
                  className="relative"
                  style={{
                    minWidth: `${CARD_WIDTH}px`,
                    maxWidth: `${CARD_WIDTH}px`,
                    perspective: "800px",      // enables smooth 3D lifting effect
                  }}
                >
                  <Card
                    className="
      rounded-xl overflow-hidden cursor-pointer shadow-md 
      transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:-translate-y-3 
      hover:shadow-2xl 
      hover:ring-2 hover:ring-blue-300/40
      hover:[transform:translateZ(40px) scale(1.03)]
      bg-white
      h-full flex flex-col
    "
                    onClick={() =>
                      navigate(`/courses/${course.id}`, { state: { from: 'dashboard' } })
                    }
                  >

                    {/* Thumbnail */}
                    <div className="h-44 relative flex-shrink-0">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                          <BookOpen size={48} className="text-white opacity-80" />
                        </div>
                      )}

                      {/* Progress bar */}
                      {course.isEnrolled && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur p-2">
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${progressVal}%`,
                                backgroundColor: getProgressColor(progressVal),
                              }}
                            ></div>
                          </div>
                          <p className="text-[10px] text-white mt-1">{progressVal}% completed</p>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-semibold text-gray-500">
                          {course.difficultyLevel}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.totalTopics || 0} topics
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 mt-4">
                        {course.isEnrolled ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/courses/${course.id}`, { state: { from: 'dashboard' } });
                              }}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                            >
                              <Play size={16} /> Continue
                            </button>
                            <button
                              onClick={(e) => initiateUnenroll(e, course)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                            >
                              <X size={16} /> Unenroll
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              navigate(`/courses/${course.id}`, { state: { from: 'dashboard' } });
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 text-white
                                ${course.accessRule === 'ON_PAYMENT'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                : 'bg-green-600 hover:bg-green-700'}`}
                          >
                            {course.accessRule === 'ON_PAYMENT' ? (
                              <>
                                <Sparkles size={16} className="text-yellow-300" />
                                <span>Buy for ₹{course.price}</span>
                              </>
                            ) : (
                              "Enroll Free"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>


              );
            })}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            aria-label="Scroll right"
            onClick={() => scrollByCards(1)}
            className={`${arrowBtnBase} right-0 -mr-10 hidden md:flex`}
            style={{ transform: "translateY(-50%)" }}
          >
            <div className={`${arrowCircleStyle}`}>
              <ChevronRight size={20} className="text-blue-600" />
            </div>
          </button>
        )}
      </div>

      {/* UNENROLL MODAL */}
      <Modal
        isOpen={unenrollModalOpen}
        onClose={() => setUnenrollModalOpen(false)}
        title="Unenroll Course"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-1">
                Are you sure you want to unenroll from{' '}
                <span className="font-bold text-gray-900">"{courseToUnenroll?.title}"</span>?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone and all your progress will be lost.
              </p>
            </div>
          </div>
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
  );
}

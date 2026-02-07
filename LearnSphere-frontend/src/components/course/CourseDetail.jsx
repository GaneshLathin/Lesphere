// src/components/course/CourseDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { courseService } from '../../services/courseService'
import { topicService } from '../../services/topicService'
import { materialService } from '../../services/materialService'
import { enrollmentService } from '../../services/enrollmentService'
import MaterialViewer from '../material/MaterialViewer'
import QuizPlayer from '../quiz/QuizPlayer'
import AIQuizGenerator from '../quiz/AIQuizGenerator'
import {
  ArrowLeft, BookOpen, Users, Clock, Award, Play, FileText,
  CheckCircle, Plus, Edit, Trash2, Upload, ChevronDown, ChevronUp, X, Eye
} from 'lucide-react'
import Card from '../common/Card'
import Loader from '../common/Loader'
import Button from '../common/Button'
import Input from '../common/Input'
import toast from 'react-hot-toast'
import { quizService } from '../../services/quizService'
import api from "../../services/api";
import { progressService } from "../../services/progressService";
import CertificateDownload from '../certificate/CertificateDownload'
import ConfirmModal from '../common/ConfirmModal'


const CourseDetail = () => {
  // const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  const [course, setCourse] = useState(null)
  const [topics, setTopics] = useState([])
  const [materials, setMaterials] = useState({})
  const [materialCounts, setMaterialCounts] = useState({}) // Track accurate counts including quizzes
  const [loading, setLoading] = useState(true)
  const [expandedTopic, setExpandedTopic] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const [showTopicModal, setShowTopicModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [selectedTopicForMaterial, setSelectedTopicForMaterial] = useState(null)
  const [courseProgress, setCourseProgress] = useState(null);


  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    level: 'BEGINNER',
    orderIndex: 0
  })

  const [materialForm, setMaterialForm] = useState({
    type: 'VIDEO',
    title: '',
    description: '',
    link: '',
    file: null
  })

  const [mcqForm, setMcqForm] = useState({
    title: '',
    description: '',
    difficulty: 'BEGINNER',
    duration: 10,
    questions: []
  })

  // New states for quiz interactions
  const [showAIQuizModal, setShowAIQuizModal] = useState(false)
  const [aiQuizModalTopicId, setAiQuizModalTopicId] = useState(null)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [showMCQUploadModal, setShowMCQUploadModal] = useState(false)
  const [selectedTopicForMCQ, setSelectedTopicForMCQ] = useState(null)

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'TOPIC' | 'MATERIAL'
    itemId: null,
    parentId: null, // For materials (topicId)
    title: '',
    message: ''
  })



  // const params = useParams();
  const isInstructor = user?.role === 'INSTRUCTOR'
  const isStudent = user?.role === 'STUDENT'
  // -----------------------------
  // 1️⃣ SAFE COURSE ID EXTRACTION
  let { id } = useParams();

  const fallbackId =
    location.state?.courseId ||
    location.state?.recommendedCourseId ||
    location.state?.course?.id;

  const courseId = Number(id || fallbackId);

  // Track completed topics for green checkmarks
  const [completedTopicIds, setCompletedTopicIds] = useState(new Set());

  useEffect(() => {
    if (user?.role === 'STUDENT' && user.studentId && courseId) {
      fetchTopicProgress();
    }
  }, [user, courseId]);

  const fetchTopicProgress = async () => {
    try {
      const res = await progressService.getTopicProgress(user.studentId);
      const studentTopicProgress = res?.data?.data || [];

      const completedSet = new Set();
      studentTopicProgress.forEach(tp => {
        if (tp.completed) {
          completedSet.add(tp.topicId);
        }
      });
      setCompletedTopicIds(completedSet);
    } catch (err) {
      console.error("Failed to load topic progress", err);
    }
  };




  const handleBack = () => {
    if (location.state?.from === 'dashboard') {
      navigate('/dashboard')
    } else if (location.state?.from === 'courses') {
      navigate('/courses')
    } else {
      navigate(-1)
    }
  }

  useEffect(() => {
    if (!courseId || isNaN(courseId)) {
      console.error("Course ID missing!");
      toast.error("Invalid Course ID");
      setLoading(false);
      return;
    }
    fetchCourseData()
  }, [courseId, user])

  // Adaptive State
  const [nextStep, setNextStep] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [nextCourseRecommendation, setNextCourseRecommendation] = useState(null);

  // Determine if popup should likely show (prevents flash)
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  // Reset completion state when courseId changes (e.g. valid navigation to new course)
  useEffect(() => {
    setShowCompletionModal(false);
    setHasShownCompletion(false);
    setNextCourseRecommendation(null);
    setCourseProgress(null); // Fix: Clear progress so it doesn't trigger modal for new course using old data
  }, [courseId]);

  useEffect(() => {
    if (user?.role === 'STUDENT' && user.studentId && courseId) {
      // Parallel fetch for efficiency
      Promise.all([
        fetchTopicProgress(),
        fetchNextStep()
      ]);
    }
  }, [user, courseId, location.state?.forceReload]); // Reload when redirected or forced

  // Check completion
  useEffect(() => {
    // Only show if progress is legitimately 100% AND fully loaded (completedTopics > 0)
    if (courseProgress && courseProgress.percentage === 100 && !hasShownCompletion && isEnrolled) {
      if (courseProgress.totalTopics > 0) { // Safety check
        fetchCompletionRecommendation();
        setShowCompletionModal(true);
        setHasShownCompletion(true); // Ensure it only shows once per session/load
      }
    }
  }, [courseProgress, isEnrolled]);

  const fetchNextStep = async () => {
    try {
      // adaptiveService.getNextTopic now calls the correct endpoint
      const res = await api.get(`/courses/${courseId}/next-step?studentId=${user.userId}`);
      // defensive check
      setNextStep(res?.data?.data ?? res?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch next step", err);
    }
  };

  const fetchCompletionRecommendation = async () => {
    try {
      // Fix: Pass studentId for accurate exclusion of completed courses
      const res = await courseService.getNextCourseRecommendation(courseId, user?.studentId);
      setNextCourseRecommendation(res?.data ?? res);
    } catch (err) {
      console.error("Failed to fetch completion recommendation", err);
    }
  };

  useEffect(() => {
    if (location.state?.recommendedTopicId && topics.length > 0) {

      const topicId = location.state.recommendedTopicId;

      setExpandedTopic(topicId);
      fetchMaterials(topicId);

      // clear the state so reopens correctly only once
      navigate(location.pathname, { replace: true });
    }
  }, [location.state?.forceReload, topics]);



  const fetchCourseData = async () => {
    setLoading(true);

    if (!courseId) {
      console.error("Course id missing!");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching course:", courseId);
      console.log("User Role " + user.role)
      // const res = await courseService.getCourseById(courseId, user?.userId);

      const res = await courseService.getCourseById(
        courseId,
        user.role === "STUDENT" ? user.userId : null

      );


      // extract actual course object
      const courseData = res?.data?.data ?? res?.data ?? res;

      if (!courseData) {
        console.error("No course data received");
        setLoading(false);
        return;
      }

      // -----------------------------
      // SET STATE PROPERLY
      // -----------------------------
      setCourse(courseData);
      setIsEnrolled(courseData?.isEnrolled || false);


      // topics
      let topicList = [];
      if (Array.isArray(courseData.topics)) {
        topicList = courseData.topics;
        setTopics(courseData.topics);
      } else {
        const topicRes = await topicService.getTopicsByCourse(courseId);
        topicList = topicRes || [];
        setTopics(topicRes || []);
      }


      // fetch progress from global student progress endpoint
      if (user?.role === 'STUDENT' && user?.studentId) {
        await loadProgress(courseId, topicList);
      }

      // fetch material counts for all topics
      await fetchAllMaterialCounts(topicList);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
      setLoading(false);
    }
  };



  // ----------------------------
  //  Progress Calculation
  // ----------------------------
  // ----------------------------
  //  Progress Calculation
  // ----------------------------
  const loadProgress = async (courseId, topicList) => {
    if (!user?.studentId) {
      console.log('No student ID, skipping progress load');
      return;
    }

    try {
      const res = await progressService.getStudentProgress(user.studentId);
      const list = res?.data?.data ?? [];

      const record = list.find((p) => p.courseId === Number(courseId));

      const totalTopics = topicList.length;
      const percentage = record?.completionPercentage ?? 0;

      // Calculate completed topics based on percentage from backend
      // Backend now correctly calculates percentage based on COMPLETED topics only
      let completedTopics = Math.round((percentage / 100) * totalTopics);

      // Safety bounds
      if (completedTopics > totalTopics) completedTopics = totalTopics;
      if (percentage === 100) completedTopics = totalTopics; // Ensure 100% shows all
      if (percentage > 0 && completedTopics === 0) completedTopics = 1; // Show at least 1 if started? No, 0 is possible if < 0.5 topic (impossible)

      setCourseProgress({
        percentage,
        completedTopics,
        totalTopics
      });

    } catch (err) {
      console.error("Progress loading failed:", err);
    }
  };

  // ----------------------------
  //  Fetch Material Counts for All Topics
  // ----------------------------
  const fetchAllMaterialCounts = async (topicList) => {
    try {
      const counts = {}
      await Promise.all(
        topicList.map(async (topic) => {
          try {
            const [materialsResponse, quizzesResponse] = await Promise.all([
              materialService.getMaterialsByTopic(topic.id),
              quizService.getQuizByTopic(topic.id)
            ])
            // materialService returns array directly, quizService returns ApiResponse wrapper
            const materials = Array.isArray(materialsResponse) ? materialsResponse : []
            const quizzesResponseData = quizzesResponse?.data;
            const quizzes = Array.isArray(quizzesResponseData) ? quizzesResponseData : (quizzesResponseData ? [quizzesResponseData] : []);
            counts[topic.id] = materials.length + quizzes.length
          } catch (err) {
            console.error(`Failed to fetch count for topic ${topic.id}:`, err)
            counts[topic.id] = topic.materialsCount || 0
          }
        })
      )
      setMaterialCounts(counts)
    } catch (error) {
      console.error('Error fetching material counts:', error)
    }
  }

  const fetchMaterials = async (topicId) => {
    try {
      const [materialsResponse, quizzesResponse] = await Promise.all([
        materialService.getMaterialsByTopic(topicId),
        quizService.getQuizByTopic(topicId)
      ])

      // materialService returns array directly, quizService returns ApiResponse wrapper
      const materials = Array.isArray(materialsResponse) ? materialsResponse : []
      const quizzesResponseData = quizzesResponse?.data;
      const quizzes = Array.isArray(quizzesResponseData) ? quizzesResponseData : (quizzesResponseData ? [quizzesResponseData] : []);

      // Combine materials only (Quizzes handled separately in UI)
      const combinedMaterials = [...materials]

      setMaterials(prev => ({
        ...prev,
        [topicId]: combinedMaterials
      }))

      // Update count
      setMaterialCounts(prev => ({
        ...prev,
        [topicId]: combinedMaterials.length + quizzes.length
      }))
    } catch (error) {
      console.error('Error fetching materials:', error)
      toast.error('Failed to load materials')
    }
  }

  const toggleTopic = async (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null)
    } else {
      setExpandedTopic(topicId)
      if (!materials[topicId]) {
        await fetchMaterials(topicId)
      }
    }
  }

  const handleEnroll = async () => {
    if (!isStudent) {
      toast.error('Only students can enroll in courses')
      return
    }
    setEnrolling(true)
    try {
      await enrollmentService.enrollCourse(user.userId, courseId)
      toast.success('Enrolled successfully!')
      setIsEnrolled(true)
      await fetchCourseData()
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  // Handler to check enrollment before accessing material
  const handleMaterialClick = (material, topicId) => {
    if (!isStudent) {
      // Instructors can always access
      setSelectedMaterial({ ...material, topicId })
      return
    }

    if (!isEnrolled) {
      toast.error('Please enroll in this course to access learning materials', {
        duration: 3000,
        icon: '🔒'
      })
      return
    }

    setSelectedMaterial({ ...material, topicId })
  }

  // Handler to check enrollment before starting quiz
  const handleQuizClick = (topic) => {
    if (!isStudent) {
      // For non-students, use existing behavior
      handleStartQuiz(topic)
      return
    }

    if (!isEnrolled) {
      toast.error('Please enroll in this course to access quizzes', {
        duration: 3000,
        icon: '🔒'
      })
      return
    }

    handleStartQuiz(topic)
  }

  const handleTopicSubmit = async (e) => {
    e.preventDefault()
    try {
      await topicService.createTopic({
        ...topicForm,
        courseId: courseId
      })

      toast.success('Topic created successfully!')
      setShowTopicModal(false)
      setTopicForm({ name: '', description: '', level: 'BEGINNER', orderIndex: 0 })

      const topicsResponse = await topicService.getTopicsByCourse(id)
      setTopics(topicsResponse || [])
    } catch (error) {
      console.error('Topic creation error:', error)
      toast.error('Failed to create topic')
    }
  }

  const confirmDeleteTopic = async () => {
    const topicId = deleteModal.itemId
    try {
      await topicService.deleteTopic(topicId)
      toast.success('Topic deleted successfully!')

      setTopics(prev => prev.filter(t => t.id !== topicId))

      setMaterials(prev => {
        const newMaterials = { ...prev }
        delete newMaterials[topicId]
        return newMaterials
      })
      closeDeleteModal()
    } catch (error) {
      console.error('Topic deletion error:', error)
      toast.error('Failed to delete topic')
    }
  }

  const handleDeleteTopic = (topicId) => {
    setDeleteModal({
      isOpen: true,
      type: 'TOPIC',
      itemId: topicId,
      title: 'Delete Topic',
      message: 'Are you sure you want to delete this topic? This action cannot be undone and will delete all associated materials.'
    })
  }

  const handleMaterialSubmit = async (e) => {
    e.preventDefault()

    try {
      if (materialForm.type === 'LINK') {
        // For external links - use URL-encoded format
        if (!materialForm.link) {
          toast.error('Please enter a valid link')
          return
        }
        const linkData = {
          topicId: selectedTopicForMaterial,
          title: materialForm.title,
          description: materialForm.description || '',
          link: materialForm.link
        }

        await materialService.createLinkMaterial(linkData)
      } else {
        // For file uploads (VIDEO, PDF)
        if (!materialForm.file) {
          toast.error('Please select a file to upload')
          return
        }

        const maxSize = materialForm.type === 'VIDEO' ? 500 * 1024 * 1024 : 50 * 1024 * 1024
        if (materialForm.file.size > maxSize) {
          toast.error(`File too large! Max size: ${materialForm.type === 'VIDEO' ? '500MB' : '50MB'}`)
          return
        }

        const formData = new FormData()
        formData.append('topicId', selectedTopicForMaterial)
        formData.append('title', materialForm.title)
        formData.append('description', materialForm.description || '')
        formData.append('materialType', materialForm.type)
        formData.append('file', materialForm.file)

        await materialService.uploadMaterial(formData)
      }

      toast.success('Material uploaded successfully!')
      closeMaterialModal()

      await fetchMaterials(selectedTopicForMaterial)
    } catch (error) {
      console.error('Material upload error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload material'
      toast.error(errorMsg)
    }
  }

  const confirmDeleteMaterial = async () => {
    const { itemId: materialId, parentId: topicId } = deleteModal
    try {
      await materialService.deleteMaterial(materialId)
      toast.success('Material deleted successfully!')
      await fetchMaterials(topicId)
      closeDeleteModal()
    } catch (error) {
      console.error('Material deletion error:', error)
      toast.error('Failed to delete material')
    }
  }

  const handleDeleteMaterial = (materialId, topicId) => {
    setDeleteModal({
      isOpen: true,
      type: 'MATERIAL',
      itemId: materialId,
      parentId: topicId,
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material? This action cannot be undone.'
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, itemId: null, parentId: null, title: '', message: '' })
  }

  const closeMaterialModal = () => {
    setShowMaterialModal(false)
    setSelectedTopicForMaterial(null)
    setMaterialForm({ type: 'VIDEO', title: '', description: '', link: '', file: null })
    setMcqForm({
      title: '',
      description: '',
      difficulty: 'BEGINNER',
      duration: 10,
      questions: []
    })
  }

  const getMaterialIcon = (type) => {
    const icons = {
      VIDEO: {
        component: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>,
        color: 'text-red-500',
        bg: 'bg-red-50'
      },
      PDF: {
        component: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      },
      LINK: {
        component: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
        color: 'text-green-500',
        bg: 'bg-green-50'
      },
      TEXT: {
        component: <FileText className="w-5 h-5" />,
        color: 'text-purple-500',
        bg: 'bg-purple-50'
      },
      QUIZ: {
        component: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000-2H3a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 000 2 2 2 0 012 2v2h1a1 1 0 110 2h-1v1a1 1 0 110-2h-1V9a1 1 0 100 2h1v1a1 1 0 110-2h-1v1a1 1 0 110 2h1v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"></path></svg>,
        color: 'text-orange-500',
        bg: 'bg-orange-50'
      }
    }
    return icons[type] || icons.PDF
  }

  // --- QUIZ HANDLERS ---
  const handleStartQuiz = async (topic) => {
    try {
      console.log("Starting quiz for topic:", topic.id)
      // fetch latest quiz for this topic
      const res = await quizService.getQuizByTopic(topic.id)
      console.log("Quiz response:", res)

      const quiz = res?.data?.data ?? res?.data ?? null;

      if (!quiz || !quiz.id) {
        console.error("Quiz not found in response:", res)
        toast.error(`No quiz found for this topic`);
        return;
      }
      // Students go to play page
      if (isStudent) {
        // navigate(`/quiz/play/${quiz.id}`, { state: { topicId: topic.id } })
        navigate(`/quiz/intro/${quiz.id}`, { state: { topicId: topic.id, quizId: quiz.id, courseId: course.id } })

      } else {
        // Instructors can also view (read-only) - navigate to same player with readonly flag
        navigate(`/quiz/play/${quiz.id}`, { state: { readonly: true, topicId: topic.id } })
      }
    } catch (err) {
      console.error('Start quiz error', err)
      toast.error('Failed to load quiz')
    }
  }

  const handleViewQuiz = async (topic) => {
    try {
      // Backend returns latest quiz (AI or Manual)
      const res = await quizService.getQuizByTopic(topic.id);
      const quiz = res?.data;

      if (!quiz || !quiz.id) {
        toast.error("No quiz found for this topic");
        return;
      }

      navigate(`/quiz/play/${quiz.id}`, {
        state: {
          readonly: true,
          topicId: topic.id,
          quizId: quiz.id
        }
      });

    } catch (err) {
      console.error("View quiz error", err);
      toast.error("Failed to open quiz");
    }
  };

  const handleOpenGenerateModal = (topicId) => {
    setAiQuizModalTopicId(topicId)
    setShowAIQuizModal(true)
  }

  const handleOpenMCQUploadModal = (topicId) => {
    setSelectedTopicForMCQ(topicId)
    setShowMCQUploadModal(true)
    setMcqForm({
      title: '',
      description: '',
      difficulty: 'BEGINNER',
      duration: 10,
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    })
  }

  const handleCloseMCQUploadModal = () => {
    setShowMCQUploadModal(false)
    setSelectedTopicForMCQ(null)
    setMcqForm({
      title: '',
      description: '',
      difficulty: 'BEGINNER',
      duration: 10,
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    })
  }

  const addMCQQuestion = () => {
    setMcqForm({
      ...mcqForm,
      questions: [...mcqForm.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    })
  }

  const removeMCQQuestion = (index) => {
    setMcqForm({
      ...mcqForm,
      questions: mcqForm.questions.filter((_, i) => i !== index)
    })
  }

  const updateMCQQuestion = (index, field, value) => {
    const updatedQuestions = [...mcqForm.questions]
    updatedQuestions[index][field] = value
    setMcqForm({ ...mcqForm, questions: updatedQuestions })
  }

  const updateMCQOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...mcqForm.questions]
    updatedQuestions[qIndex].options[oIndex] = value
    setMcqForm({ ...mcqForm, questions: updatedQuestions })
  }


  const handleMCQUploadSubmit = async (e) => {
    e.preventDefault();

    try {
      // ---------- BASIC VALIDATIONS ----------
      if (!mcqForm.title.trim()) {
        toast.error("Quiz title is required");
        return;
      }

      if (!mcqForm.questions || mcqForm.questions.length === 0) {
        toast.error("At least one question is required");
        return;
      }

      for (let i = 0; i < mcqForm.questions.length; i++) {
        const q = mcqForm.questions[i];

        if (!q.questionText.trim()) {
          toast.error(`Question ${i + 1} text is required`);
          return;
        }

        if (!q.options || q.options.length !== 4 || q.options.some(opt => !opt.trim())) {
          toast.error(`Question ${i + 1} must have 4 valid options`);
          return;
        }

        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          toast.error(`Question ${i + 1} must have a correct answer selected`);
          return;
        }
      }

      // ---------- PAYLOAD (MATCHES BACKEND DTO EXACTLY) ----------
      const payload = {
        courseId: courseId,
        topicId: selectedTopicForMCQ,
        title: mcqForm.title,
        duration: mcqForm.duration,
        questions: mcqForm.questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      };

      // ---------- API CALL ----------
      await quizService.saveManualQuiz(payload);

      toast.success("Manual MCQ Quiz uploaded successfully!");

      // ---------- CLEANUP ----------
      handleCloseMCQUploadModal();

      // Refresh course data so quiz appears immediately
      await fetchCourseData();

    } catch (error) {
      console.error("MCQ upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload MCQ quiz");
    }
  };


  const handleAIGeneratedSaved = async (savedQuiz) => {
    // savedQuiz may be returned depending on AI component/service implementation
    setShowAIQuizModal(false)
    toast.success('AI Quiz saved successfully')
    // Optionally refresh topics / materials or other UI
    // If your API created a quiz tied to topic, nothing else required. But we can refresh data:
    await fetchCourseData()
  }

  const getProgressColor = (percent) => {
    if (percent < 30) return "#ef4444";  // red
    if (percent < 70) return "#facc15";  // yellow
    return "#22c55e";                    // green
  };

  if (loading || !course) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteModal.type === 'TOPIC' ? confirmDeleteTopic : confirmDeleteMaterial}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText="Delete"
        variant="danger"
      />
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">



        {/* 🔥 COMPLETION POPUP MODAL */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">Course Completed!</h2>
                <p className="text-green-100 mt-1">You've mastered {course.title}!</p>
              </div>

              <div className="p-6">
                <h3 className="text-gray-900 font-bold text-lg mb-3">What's Next?</h3>

                {nextCourseRecommendation ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 cursor-pointer hover:border-blue-300 transition" onClick={() => navigate(`/courses/${nextCourseRecommendation.id}`)}>
                    <div className="flex gap-4">
                      <img src={nextCourseRecommendation.thumbnailUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Recommended</p>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{nextCourseRecommendation.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-200 px-1.5 rounded">{nextCourseRecommendation.difficultyLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-6">You're all set! Check the dashboard for more courses.</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setShowCompletionModal(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCompletionModal(false); // Close explicitly
                      if (nextCourseRecommendation) {
                        navigate(`/courses/${nextCourseRecommendation.id}`);
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                  >
                    {nextCourseRecommendation ? "Start Next Course" : "Go to Dashboard"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card>
            <div className="h-64 md:h-96 relative overflow-hidden">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center" style={course.thumbnailUrl ? { display: 'none' } : {}}>
                <BookOpen size={96} className="text-white opacity-80" />
              </div>
              {isEnrolled && (
                <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>Enrolled</span>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${course.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                  course.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {course.difficultyLevel}
                </span>
                {isInstructor && (
                  <Button
                    onClick={() => navigate(`/courses/edit/${id}`)}
                    variant="secondary"
                    size="sm"
                    icon={Edit}
                  >
                    Edit Course
                  </Button>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>


              <p className="text-gray-600 text-lg mb-6">
                {course.description || 'No description available.'}
              </p>


              {/* =================== PROGRESS BLOCK =================== */}
              {isStudent && isEnrolled && courseProgress && (
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Your Progress</p>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xl font-bold">
                      {courseProgress.percentage}%
                    </span>

                    <span className="text-sm text-gray-500">
                      {courseProgress.completedTopics} / {courseProgress.totalTopics} topics
                    </span>
                  </div>


                  <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${courseProgress.percentage}%`,
                        backgroundColor: getProgressColor(courseProgress.percentage)
                      }}
                    />
                  </div>

                  {/* Certificate Download Section */}
                  <CertificateDownload
                    courseId={courseId}
                    studentId={user.studentId}
                    isCompleted={courseProgress.percentage === 100}
                  />
                </div>
              )}


              <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users size={20} />
                  <span className="text-sm">{course.totalEnrollments || 0} students</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock size={20} />
                  <span className="text-sm">{course.duration || 0} minutes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FileText size={20} />
                  <span className="text-sm">{topics.length} topics</span>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Instructor</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {course.instructorName?.charAt(0) || 'I'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{course.instructorName}</p>
                    <p className="text-sm text-gray-500">Course Instructor</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Topics & Materials */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
              {isInstructor && (
                <Button
                  onClick={() => setShowTopicModal(true)}
                  variant="primary"
                  size="sm"
                  icon={Plus}
                >
                  Add Topic
                </Button>
              )}
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No topics added yet</p>
                {isInstructor && (
                  <Button
                    onClick={() => setShowTopicModal(true)}
                    variant="primary"
                    size="sm"
                    className="mt-4"
                  >
                    Add First Topic
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((topic, index) => {
                  const topicMaterials = materials[topic.id] || []
                  const materialCount = materialCounts[topic.id] ?? topic.materialsCount ?? 0

                  return (
                    <div key={topic.id} className="border border-gray-200 rounded-lg">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{topic.name}</h3>

                            </div>
                            <p className="text-sm text-gray-500">
                              {materialCount} material{materialCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isInstructor && (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTopicForMaterial(topic.id)
                                  setShowMaterialModal(true)
                                }}
                                variant="secondary"
                                size="sm"
                                icon={Plus}
                              >
                                Add Material
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTopic(topic.id)
                                }}
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                              />
                            </>
                          )}
                          {completedTopicIds.has(topic.id) && (
                            <span className="flex items-center text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full mr-3">
                              <CheckCircle size={12} className="mr-1" /> Completed
                            </span>
                          )}
                          {expandedTopic === topic.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {/* Materials Display */}
                      {expandedTopic === topic.id && (
                        <>
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            {topic.description && (
                              <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                            )}

                            {topicMaterials.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">No materials added yet</p>
                            ) : (
                              <div className="space-y-2">
                                {topicMaterials.map((material) => {
                                  const iconData = getMaterialIcon(material.materialType)
                                  const isLocked = isStudent && !isEnrolled

                                  return (
                                    <div
                                      key={material.id}
                                      className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 transition-colors ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 cursor-pointer'
                                        }`}
                                      onClick={() => handleMaterialClick(material, topic.id)}
                                    >
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className={`${iconData.bg} p-2 rounded-lg relative`}>
                                          <div className={iconData.color}>
                                            {iconData.component}
                                          </div>
                                          {isLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                              <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{material.title}</p>
                                            {isLocked && (
                                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">🔒 Locked</span>
                                            )}
                                          </div>
                                          {material.description && (
                                            <p className="text-xs text-gray-500">{material.description}</p>
                                          )}
                                          <p className="text-xs text-gray-400 mt-1">
                                            {material.materialType} • {isLocked ? 'Enroll to access' : 'Click to view'}
                                          </p>
                                        </div>
                                      </div>
                                      {isInstructor && (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteMaterial(material.id, topic.id)
                                          }}
                                          variant="danger"
                                          size="sm"
                                          icon={Trash2}
                                        />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* ===== NEW: Quiz Section (right under materials list) ===== */}
                          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">Quiz</h4>
                                  <p className="text-sm text-gray-600">Test your understanding of this topic</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {isStudent && (
                                  <Button
                                    onClick={() => handleQuizClick(topic)}
                                    variant={!isEnrolled ? "secondary" : "primary"}
                                    size="sm"
                                    icon={!isEnrolled ? undefined : Play}
                                    disabled={!isEnrolled}
                                    className={!isEnrolled ? "opacity-60 cursor-not-allowed" : ""}
                                  >
                                    {!isEnrolled ? '🔒 Locked' : 'Start Quiz'}
                                  </Button>
                                )}

                                {isInstructor && (
                                  <>
                                    <Button
                                      onClick={() => handleOpenGenerateModal(topic.id)}
                                      variant="secondary"
                                      size="sm"
                                      className="bg-white border border-purple-300 text-purple-700 hover:bg-purple-50"
                                    >
                                      Generate
                                    </Button>

                                    <Button
                                      onClick={() => handleOpenMCQUploadModal(topic.id)}
                                      variant="secondary"
                                      size="sm"
                                      icon={Upload}
                                      className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-50"
                                      title="Upload MCQ questions manually"
                                    >
                                      Upload MCQ
                                    </Button>


                                    <Button
                                      onClick={() => handleViewQuiz(topic)}
                                      variant="secondary"
                                      size="sm"
                                      icon={Eye}
                                    >
                                      View Quiz
                                    </Button>

                                  </>
                                )}
                              </div>
                            </div>

                            {/* Small hint line */}
                            <p className="mt-3 text-xs text-gray-500">
                              {isInstructor ? 'Generate a quiz using AI or view the latest saved quiz (read-only).' :
                                isEnrolled ? 'Start the latest quiz for this topic. If no quiz exists ask your instructor to generate one.' :
                                  '🔒 Enroll in this course to access quizzes and test your knowledge.'}
                            </p>
                          </div>
                          {/* ===== end quiz section ===== */}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-gray-900">Free</span>
                <Award size={32} className="text-yellow-500" />
              </div>

              {isEnrolled ? (
                <Button variant="success" size="lg" className="w-full" icon={Play}>
                  Continue Learning
                </Button>
              ) : isStudent ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">Login as student to enroll</p>
                </div>
              )}

              <div className="pt-6 border-t space-y-3">
                <h3 className="font-semibold text-gray-900">This course includes:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <span>{topics.length} comprehensive topics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    <span>AI-powered quizzes</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div >

      {/* Topic Modal */}
      {
        showTopicModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 transition-all duration-300">
            <Card className="max-w-lg w-full p-6 border-2 border-blue-400 shadow-xl rounded-2xl bg-white/90 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add New Topic</h3>
                <button onClick={() => setShowTopicModal(false)}>
                  <X size={24} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <Input
                  label="Topic Name"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                  <select
                    value={topicForm.level}
                    onChange={(e) => setTopicForm({ ...topicForm, level: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">Add Topic</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowTopicModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )
      }

      {/* Material Modal */}
      {
        showMaterialModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 transition-all duration-300">
            <Card className="max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border-2 border-purple-400 shadow-xl rounded-2xl bg-white/90 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Material</h3>
                <button onClick={closeMaterialModal}>
                  <X size={24} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <form onSubmit={handleMaterialSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Material Type</label>
                  <select
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value, file: null, link: '' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF Document</option>
                    <option value="LINK">External Link</option>
                  </select>
                </div>

                <Input
                  label="Title"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  required
                  placeholder="Enter material title"
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter description"
                  />
                </div>

                {materialForm.type === 'LINK' ? (
                  <Input
                    label="Link URL"
                    type="url"
                    value={materialForm.link}
                    onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })}
                    placeholder="https://example.com or https://youtube.com/watch?v=..."
                    required
                  />
                ) : materialForm.type !== 'MCQ' ? (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Upload File</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const maxSize = materialForm.type === 'VIDEO' ? 500 * 1024 * 1024 : 50 * 1024 * 1024
                          if (file.size > maxSize) {
                            toast.error(`File too large! Max: ${materialForm.type === 'VIDEO' ? '500MB' : '50MB'}`)
                            e.target.value = ''
                            return
                          }
                        }
                        setMaterialForm({ ...materialForm, file })
                      }}
                      accept={materialForm.type === 'VIDEO' ? 'video/*' : 'application/pdf'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    {materialForm.file && (
                      <p className="text-xs text-gray-600 mt-1">
                        Selected: {materialForm.file.name} ({(materialForm.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {materialForm.type === 'VIDEO' ? 'Max size: 500MB' : 'Max size: 50MB'}
                    </p>
                  </div>
                ) : null}

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1" icon={Upload}>
                    Upload Material
                  </Button>
                  <Button type="button" variant="secondary" onClick={closeMaterialModal} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )
      }

      {/* AI Quiz Generator Modal (Instructor) */}
      {
        showAIQuizModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 transition-all duration-300">
            <Card className="max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border-2 border-purple-400 shadow-xl rounded-2xl bg-white/90 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">AI Quiz Generator</h3>
                <button onClick={() => setShowAIQuizModal(false)}>
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* UPDATED: Passing instructorId, courseId, topicId */}
              <AIQuizGenerator
                instructorId={user?.userId}
                courseId={courseId}
                topicId={aiQuizModalTopicId}
              />
            </Card>
          </div>
        )
      }


      {/* Material Viewer or Quiz Player */}
      {
        selectedMaterial && (
          <>
            {selectedMaterial.materialType === 'QUIZ' ? (
              <QuizPlayer
                quiz={selectedMaterial.quiz}
                onClose={() => setSelectedMaterial(null)}
              />
            ) : (
              <MaterialViewer
                material={selectedMaterial}
                topicId={selectedMaterial?.topicId}
                onClose={() => setSelectedMaterial(null)}
              />
            )}
          </>
        )
      }

      {/* MCQ Upload Modal (Instructor) */}
      {
        showMCQUploadModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border-2 border-blue-400 shadow-xl rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Upload MCQ Quiz</h3>
                <button onClick={handleCloseMCQUploadModal}>
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleMCQUploadSubmit} className="space-y-4">
                {/* Quiz Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                  <Input
                    value={mcqForm.title}
                    onChange={(e) => setMcqForm({ ...mcqForm, title: e.target.value })}
                    placeholder="Enter quiz title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={mcqForm.description}
                    onChange={(e) => setMcqForm({ ...mcqForm, description: e.target.value })}
                    placeholder="Enter quiz description"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Difficulty & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={mcqForm.difficulty}
                      onChange={(e) => setMcqForm({ ...mcqForm, difficulty: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={mcqForm.duration}
                      onChange={(e) => setMcqForm({ ...mcqForm, duration: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Questions */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Questions ({mcqForm.questions.length})</h4>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {mcqForm.questions.map((question, qIndex) => (
                      <Card key={qIndex} className="p-4 bg-gray-50 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-gray-700">Question {qIndex + 1}</h5>
                          {mcqForm.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMCQQuestion(qIndex)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Question Text */}
                        <textarea
                          value={question.questionText}
                          onChange={(e) => updateMCQQuestion(qIndex, 'questionText', e.target.value)}
                          placeholder="Enter question"
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
                          required
                        />

                        {/* Options */}
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600 w-8">{String.fromCharCode(65 + oIndex)}.</span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateMCQOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                              />
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  value={option}
                                  checked={question.correctAnswer === option}
                                  onChange={(e) => updateMCQQuestion(qIndex, 'correctAnswer', e.target.value)}
                                  required
                                />
                                <span className="text-xs text-gray-600">Correct</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={addMCQQuestion}
                    variant="secondary"
                    className="mt-3 w-full"
                  >
                    Add Question
                  </Button>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button type="submit" variant="primary" className="flex-1">
                    Upload MCQ Quiz
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCloseMCQUploadModal} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )
      }
    </div >
  )
}

export default CourseDetail


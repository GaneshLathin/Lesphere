// src/components/course/CourseDetail.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { courseService } from '../../services/courseService'
import { topicService } from '../../services/topicService'
import { materialService } from '../../services/materialService'
import { enrollmentService } from '../../services/enrollmentService'
import MaterialViewer from '../material/MaterialViewer'
import QuizPlayer from '../quiz/QuizPlayer'
import AIQuizGenerator from '../quiz/AIQuizGenerator'
import QuizBuilder from '../quiz/QuizBuilder'
import {
  ArrowLeft, BookOpen, Users, Clock, Award, Play, FileText,
  CheckCircle, Plus, Edit, Trash2, Upload, ChevronDown, ChevronUp, X, Eye,
  MoreVertical, File, Download, Link as LinkIcon, Lock, IndianRupee, Sparkles, Circle, Share2
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
import ReviewSection from './ReviewSection'
import CourseReviewModal from './CourseReviewModal'
import AnimatedBackground from '../common/AnimatedBackground'
import CircularProgress from '../common/CircularProgress'
import { fadeInUp, fadeIn, scaleIn, staggerContainer, slideInLeft, slideInRight } from '../../utils/animations'


const CourseDetail = () => {
  // const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
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
  const [showSharePreview, setShowSharePreview] = useState(false);


  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    level: 'BEGINNER',
    orderIndex: 0
  })

  // Material Modal State
  const [materialModalTab, setMaterialModalTab] = useState('CONTENT') // CONTENT, DESCRIPTION, ATTACHMENTS
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [materialForm, setMaterialForm] = useState({
    type: 'VIDEO',
    title: '',
    description: '',
    link: '',
    file: null,
    responsible: '',
    durationMinutes: '',
    allowDownload: false,
    existingAttachments: [],
    topicId: null
  })
  const [newAttachments, setNewAttachments] = useState([]) // Array of Files or Link Objects
  const [activeMenuId, setActiveMenuId] = useState(null) // For 3-dot menu toggle

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
  const [completedMaterialIds, setCompletedMaterialIds] = useState(new Set());
  const [topicQuizzes, setTopicQuizzes] = useState({}); // Store quizzes per topic

  const fetchMaterialProgress = async () => {
    if (user?.studentId) {
      try {
        const m = await import('../../services/materialProgressService');
        const res = await m.materialProgressService.getCompletedMaterials(user.studentId);
        if (res.data) {
          setCompletedMaterialIds(new Set(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch material progress", err);
      }
    }
  };

  useEffect(() => {
    if (user?.role === 'STUDENT' && user.studentId && courseId) {
      fetchTopicProgress();
      fetchMaterialProgress();
    }
  }, [user, courseId]);

  const handleToggleMaterial = async (materialId, e) => {
    e.stopPropagation();
    if (!isStudent || !isEnrolled) return;

    // Optimistic update
    const isCompleted = completedMaterialIds.has(materialId);
    const newSet = new Set(completedMaterialIds);
    if (isCompleted) {
      newSet.delete(materialId);
      // Note: Backend might not support "un-complete" easily if it's an append-only log, 
      // but we'll assume toggle for UI. 
      // If backend doesn't support unchecking, this might revert on refresh.
    } else {
      newSet.add(materialId);
      try {
        // Call backend to mark complete
        // We need studentId. 
        if (user?.studentId) {
          await import('../../services/materialProgressService').then(m => m.materialProgressService.markMaterialCompleted(user.studentId, materialId));
          toast.success("Marked as done");
        }
      } catch (err) {
        console.error("Failed to mark material", err);
        toast.error("Failed to update progress");
        // Revert
        newSet.delete(materialId);
        if (isCompleted) newSet.add(materialId); // restore
        setCompletedMaterialIds(newSet);
        return;
      }
    }
    setCompletedMaterialIds(newSet);
  };

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [nextCourseRecommendation, setNextCourseRecommendation] = useState(null);

  // Determine if popup should likely show (prevents flash)
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  // Reset completion state when courseId changes (e.g. valid navigation to new course)
  useEffect(() => {
    setShowCompletionModal(false);
    setShowReviewModal(false);
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
        // TRIGGER REVIEW MODAL FIRST
        setShowReviewModal(true);
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
      console.log("User Role:", user?.role || "Guest")
      // const res = await courseService.getCourseById(courseId, user?.userId);

      const res = await courseService.getCourseById(
        courseId,
        user?.role === "STUDENT" ? user?.userId : null

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


      setLoading(false); // OPTIMIZATION: Show content immediately, don't wait for counts

      // fetch progress from global student progress endpoint
      if (user?.role === 'STUDENT' && user?.studentId) {
        loadProgress(courseId, topicList); // Run in background
      }

      // fetch material counts for all topics
      fetchAllMaterialCounts(topicList); // Run in background
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

      // Update topicQuizzes state so the UI knows to render the quiz section
      if (quizzes.length > 0) {
        setTopicQuizzes(prev => ({
          ...prev,
          [topicId]: quizzes[0] // Assuming 1 quiz per topic
        }))
      } else {
        // Clear if no quiz (e.g. if deleted)
        setTopicQuizzes(prev => {
          const newState = { ...prev };
          delete newState[topicId];
          return newState;
        })
      }
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


  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleEnroll = async () => {
    console.log('handleEnroll called - isAuthenticated:', isAuthenticated, 'user:', user)

    // Check if user is logged in
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login...')
      toast.error('Please log in to enroll in this course')
      // Redirect to login with return URL
      navigate(`/login?redirect=/courses/${courseId}`)
      return
    }

    if (!isStudent) {
      toast.error('Only students can enroll in courses')
      return
    }
    setEnrolling(true)

    // Check if course is paid
    if (course.price && course.price > 0) {
      // Paid Course Flow
      try {
        const res = await loadRazorpay()
        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?')
          setEnrolling(false)
          return
        }

        // Create Order
        const orderData = await api.post(`/payment/create-order?courseId=${courseId}`)
        const { amount, id: order_id, currency, key } = orderData.data

        const options = {
          key: key || "rzp_test_S2n8hNC4HsIQ0U", // Fallback if key not in response
          amount: amount.toString(),
          currency: currency,
          name: "LearnSphere",
          description: `Enrollment for ${course.title}`,
          // image: "/logo.png", // Optional: Add logo url if available
          order_id: order_id,
          handler: async function (response) {
            try {
              const verifyData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: courseId.toString(),
                studentId: user.userId.toString() // Send userId, backend expects it
              }

              const verifyRes = await api.post('/payment/verify', verifyData)
              if (verifyRes.status === 200) {
                toast.success('Payment Successful & Enrolled!')
                setIsEnrolled(true)
                await fetchCourseData()
              } else {
                toast.error('Payment verification failed')
              }
            } catch (err) {
              console.error("Payment verification error", err)
              toast.error('Payment verification failed')
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || "" // If phone available
          },
          notes: {
            address: "LearnSphere Corporate Office"
          },
          theme: {
            color: "#3399cc"
          }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()

        paymentObject.on('payment.failed', function (response) {
          toast.error(response.error.description);
        });

      } catch (error) {
        console.error('Payment initiation error:', error)
        toast.error('Failed to initiate payment')
      } finally {
        setEnrolling(false)
      }

    } else {
      // Free Course Flow (Existing)
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
  }

  // Handler to check enrollment before accessing material
  const handleMaterialClick = async (material, topicId) => {
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

    // Special handling for LINK type: Open directly and mark complete
    if (material.materialType === 'LINK') {
      const url = material.externalUrl || material.link;
      if (url) {
        window.open(url, '_blank');

        // Mark as complete if not already
        if (!completedMaterialIds.has(material.id)) {
          try {
            // Optimistic update
            setCompletedMaterialIds(prev => {
              const newSet = new Set(prev);
              newSet.add(material.id);
              return newSet;
            });

            if (user?.studentId) {
              const m = await import('../../services/materialProgressService');
              await m.materialProgressService.markMaterialCompleted(user.studentId, material.id);
              toast.success("Marked as completed");
              fetchMaterialProgress(); // Sync completed items
              loadProgress(courseId, topics); // Sync progress bar
            }
          } catch (err) {
            console.error("Failed to auto-complete link:", err);
          }
        }
      } else {
        toast.error("Invalid link URL");
      }
      return; // Skip opening the modal
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

  /* -------------------------------------------------------------------------- */
  /*                       MATERIAL HANDLERS (CREATE / EDIT)                    */
  /* -------------------------------------------------------------------------- */

  const handleEditMaterial = (material, topicId) => {
    setEditingMaterial(material)
    setSelectedTopicForMaterial(topicId)

    // Populate form
    setMaterialForm({
      type: material.materialType,
      title: material.title,
      description: material.description || '',
      link: material.externalUrl || '',
      file: null, // File input cannot be pre-filled
      responsible: material.responsible || '',
      durationMinutes: material.durationMinutes || '',
      allowDownload: material.allowDownload || false,
      existingAttachments: material.attachments || []
    })

    setNewAttachments([])
    setMaterialModalTab('CONTENT')
    setShowMaterialModal(true)
    setActiveMenuId(null) // Close menu
  }

  const handleMaterialSubmit = async (e) => {
    e.preventDefault()

    if (!materialForm.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      let responseMaterial = null

      const commonData = {
        title: materialForm.title,
        description: materialForm.description,
        responsible: materialForm.responsible,
        durationMinutes: (materialForm.durationMinutes !== '' && materialForm.durationMinutes !== null && materialForm.durationMinutes !== undefined) ? parseInt(materialForm.durationMinutes) : 0,
        allowDownload: materialForm.allowDownload !== undefined ? materialForm.allowDownload : true
      }

      if (editingMaterial) {
        // --- UPDATE MODE ---
        const formData = new FormData()
        formData.append('title', commonData.title)
        formData.append('description', commonData.description || '')
        if (commonData.responsible) formData.append('responsible', commonData.responsible)
        if (commonData.durationMinutes !== null && commonData.durationMinutes !== undefined) formData.append('durationMinutes', commonData.durationMinutes)
        formData.append('allowDownload', commonData.allowDownload)

        // If type changed or file/link updated
        if (materialForm.type !== editingMaterial.materialType) {
          formData.append('materialType', materialForm.type)
        }

        if (materialForm.type === 'LINK') {
          if (materialForm.link) formData.append('link', materialForm.link)
        } else {
          if (materialForm.file) formData.append('file', materialForm.file)
        }

        responseMaterial = await materialService.updateMaterial(editingMaterial.id, formData)
        toast.success('Material updated successfully')

      } else {
        // --- CREATE MODE ---
        if (materialForm.type === 'LINK') {
          if (!materialForm.link) {
            toast.error('Please enter a valid link')
            return
          }
          const linkData = {
            topicId: selectedTopicForMaterial,
            ...commonData,
            link: materialForm.link
          }
          responseMaterial = await materialService.createLinkMaterial(linkData)

        } else {
          // VIDEO / PDF
          if (!materialForm.file) {
            toast.error('Please select a file')
            return
          }

          // IMPORTANT: Capture file reference before any async operations
          // to prevent ERR_UPLOAD_FILE_CHANGED error
          const fileToUpload = materialForm.file

          const topicIdToUse = selectedTopicForMaterial || materialForm.topicId

          if (!topicIdToUse) {
            toast.error('Error: Topic ID is missing. Please close and reopen the modal.')
            return
          }

          console.log('Submit - Selected Topic ID:', topicIdToUse)
          const formData = new FormData()
          formData.append('topicId', topicIdToUse)
          formData.append('materialType', materialForm.type)
          formData.append('file', fileToUpload) // Use captured file reference
          formData.append('title', commonData.title)
          formData.append('description', commonData.description || '')
          if (commonData.responsible) formData.append('responsible', commonData.responsible)
          if (commonData.durationMinutes !== null && commonData.durationMinutes !== undefined) formData.append('durationMinutes', commonData.durationMinutes)
          formData.append('allowDownload', commonData.allowDownload)

          responseMaterial = await materialService.uploadMaterial(formData)
        }
        toast.success('Material created successfully')
      }

      // --- HANDLE NEW ATTACHMENTS (For both Create and Edit) ---
      if (responseMaterial && newAttachments.length > 0) {
        const materialId = responseMaterial.id
        const uploadPromises = newAttachments.map(att => {
          const attData = new FormData()
          if (att.file) {
            attData.append('file', att.file)
          } else if (att.link) {
            attData.append('link', att.link)
          }
          return materialService.addAttachment(materialId, attData)
        })

        await Promise.all(uploadPromises)
        toast.success(`${newAttachments.length} attachments added`)
      }

      closeMaterialModal()

      // Refresh materials for the specific topic to show updates immediately
      const topicId = selectedTopicForMaterial || materialForm.topicId
      if (topicId) {
        await fetchMaterials(topicId)
      }

      await fetchCourseData() // Refresh course data as well

    } catch (error) {
      console.error('Material submit error:', error)
      toast.error(error.message || 'Failed to save material')
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await materialService.deleteAttachment(attachmentId)
      toast.success("Attachment removed")
      // Refresh if editing
      if (editingMaterial) {
        // We need to refresh the editingMaterial state or just close modal
        // Ideally fetch updated material
      }
      // Simplest is generic refresh
      await fetchCourseData()

      // If we are in modal, we should remove it from local state 'materialForm.existingAttachments'
      setMaterialForm(prev => ({
        ...prev,
        existingAttachments: prev.existingAttachments.filter(a => a.id !== attachmentId)
      }))

    } catch (err) {
      toast.error("Failed to delete attachment")
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
    setEditingMaterial(null)
    setMaterialForm({ type: 'VIDEO', title: '', description: '', link: '', file: null, topicId: null })
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
      IMAGE: {
        component: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50'
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

  const handleEditQuiz = (quiz, topicId) => {
    // Navigate to quiz builder in edit mode
    navigate(`/quiz/edit/${quiz.id}`, {
      state: {
        quiz,
        topicId,
        courseId: courseId
      }
    })
  }

  const handleDeleteQuiz = async (quizId, topicId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }

    try {
      await quizService.deleteQuiz(quizId)
      toast.success('Quiz deleted successfully!')

      // Refresh materials to update the quiz display
      await fetchMaterials(topicId)
    } catch (error) {
      console.error('Quiz deletion error:', error)
      toast.error('Failed to delete quiz')
    }
  }

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



        {/* NEW QUIZ BUILDER (Full Screen) */}
        {showMCQUploadModal && (
          <QuizBuilder
            courseId={courseId}
            topicId={selectedTopicForMCQ}
            onBack={handleCloseMCQUploadModal}
            onSuccess={() => {
              handleCloseMCQUploadModal();
              fetchCourseData();
              toast.success("Quiz Published Successfully!");
            }}
          />
        )}

        {/* ⭐ NEW: COURSE REVIEW MODAL ⭐ */}
        <CourseReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setShowCompletionModal(true); // Sequence to completion even if skipped
          }}
          onSubmitSuccess={() => {
            setShowReviewModal(false);
            setShowCompletionModal(true); // Sequence to completion
          }}
          courseId={courseId}
          user={user}
        />

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
          {/* Hero Section - Enhanced with Animations */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="overflow-hidden">
              {/* Animated Header Image with Gradient Overlay */}
              <div className="h-64 md:h-96 relative overflow-hidden group">
                <AnimatedBackground />
                {course.thumbnailUrl ? (
                  <motion.img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center"
                  style={course.thumbnailUrl ? { display: 'none' } : {}}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <BookOpen size={96} className="text-white opacity-90 drop-shadow-2xl" />
                  </motion.div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {isEnrolled && (
                  <motion.div
                    className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-full font-semibold flex items-center space-x-2 shadow-lg backdrop-blur-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CheckCircle size={20} />
                    <span>Enrolled</span>
                  </motion.div>
                )}
              </div>

              {/* Course Info Section - Enhanced */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
                <motion.div
                  className="mb-4 flex items-center justify-between"
                  variants={slideInLeft}
                  initial="hidden"
                  animate="visible"
                >
                  <span className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md backdrop-blur-sm ${course.difficultyLevel === 'BEGINNER'
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                    course.difficultyLevel === 'INTERMEDIATE'
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                      'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                    }`}>
                    {course.difficultyLevel}
                  </span>
                  {isInstructor && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => navigate(`/courses/edit/${id}`)}
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        className="shadow-md hover:shadow-lg transition-shadow"
                      >
                        Edit Course
                      </Button>
                    </motion.div>
                  )}
                </motion.div>

                <motion.h1
                  className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-4 leading-tight"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  {course.title}
                </motion.h1>

                <motion.p
                  className="text-gray-700 text-lg mb-6 leading-relaxed"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  {course.description || 'No description available.'}
                </motion.p>

                {/* Enhanced Progress Block */}
                {isStudent && isEnrolled && courseProgress && (
                  <motion.div
                    className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold text-purple-600 mb-1">Your Progress</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                              {courseProgress.percentage}%
                            </span>
                            <span className="text-sm text-gray-500">
                              {courseProgress.completedTopics} / {courseProgress.totalTopics} topics
                            </span>
                          </div>
                        </div>
                        <CircularProgress percentage={courseProgress.percentage} size={100} strokeWidth={6} />
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${courseProgress.percentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                      </div>

                      {/* Certificate Download Section */}
                      <div className="mt-4">
                        <CertificateDownload
                          courseId={courseId}
                          studentId={user.userId}
                          isCompleted={courseProgress.percentage === 100}
                        />
                        {courseProgress.percentage === 100 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 flex flex-col items-center"
                          >
                            {!showSharePreview ? (
                              <button
                                onClick={() => setShowSharePreview(true)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5"
                              >
                                <Share2 size={20} />
                                <span>Share Achievement</span>
                              </button>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 max-w-sm w-full relative overflow-hidden"
                              >
                                {/* Close X */}
                                <button onClick={() => setShowSharePreview(false)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                  <X size={16} />
                                </button>

                                <div className="text-center mb-4">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Award className="text-blue-600" size={24} />
                                  </div>
                                  <h4 className="font-bold text-gray-800">Share Your Success</h4>
                                  <p className="text-xs text-gray-500">Preview your post</p>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 mb-4 italic">
                                  "I just successfully completed the {course.title} course on LearnSphere! 🎓 #Learning #SkillDev #LearnSphere"
                                </div>

                                <button
                                  onClick={() => {
                                    const text = `I just successfully completed the ${course.title} course on LearnSphere! 🎓 #Learning #SkillDev #LearnSphere`;
                                    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
                                    window.open(url, '_blank', 'width=600,height=600');
                                    setShowSharePreview(false);
                                  }}
                                  className="w-full flex items-center justify-center space-x-2 bg-[#0077b5] hover:bg-[#006097] text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md"
                                >
                                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                  <span>Post to LinkedIn</span>
                                </button>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Course Stats - Enhanced */}
                <motion.div
                  className="grid grid-cols-3 gap-4 mt-6 mb-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { icon: Users, label: `${course.totalEnrollments || 0} students`, color: 'from-blue-500 to-cyan-500' },
                    { icon: Clock, label: `${course.duration || 0} minutes`, color: 'from-purple-500 to-pink-500' },
                    { icon: FileText, label: `${topics.length} topics`, color: 'from-orange-500 to-red-500' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100"
                      variants={fadeInUp}
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                        <stat.icon size={20} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Instructor Section - Enhanced */}
                <motion.div
                  className="pt-6 border-t border-gray-200"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-semibold text-gray-600 mb-3">Course Instructor</p>
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-white font-bold text-xl">
                        {course.instructorName?.charAt(0) || 'I'}
                      </span>
                    </motion.div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{course.instructorName}</p>
                      <p className="text-sm text-gray-600">Course Instructor</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Topics & Materials - Enhanced */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 md:p-8 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex items-center justify-between mb-6">
                <motion.h2
                  className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  Course Content
                </motion.h2>
                {isInstructor && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowTopicModal(true)}
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      className="shadow-md hover:shadow-lg transition-shadow"
                    >
                      Add Topic
                    </Button>
                  </motion.div>
                )}
              </div>

              {topics.length === 0 ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <FileText size={48} className="text-purple-500" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">No topics added yet</p>
                  <p className="text-gray-500 text-sm mb-4">Start building your course by adding the first topic</p>
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
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {topics.map((topic, index) => {
                    const topicMaterials = materials[topic.id] || []
                    const materialCount = materialCounts[topic.id] ?? topic.materialsCount ?? 0
                    const isExpanded = expandedTopic === topic.id

                    return (
                      <motion.div
                        key={topic.id}
                        className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300"
                        variants={fadeInUp}
                        whileHover={{ y: -2 }}
                      >
                        {/* Topic Header */}
                        <div
                          className="flex items-center justify-between p-5 cursor-pointer bg-gradient-to-r from-white to-purple-50/30 hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300"
                          onClick={() => toggleTopic(topic.id)}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Topic Number Badge */}
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </motion.div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-bold text-gray-900 text-lg">{topic.name}</h3>
                                {completedTopicIds.has(topic.id) && (
                                  <motion.span
                                    className="flex items-center text-green-600 text-xs font-bold bg-green-100 px-3 py-1 rounded-full border border-green-200"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                  >
                                    <CheckCircle size={14} className="mr-1" /> Completed
                                  </motion.span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1">
                                  <FileText size={14} />
                                  {materialCount} material{materialCount !== 1 ? 's' : ''}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isInstructor && (
                              <>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log('Opening Modal for Topic:', topic.id)
                                      setSelectedTopicForMaterial(topic.id)
                                      setMaterialForm(prev => ({ ...prev, topicId: topic.id }))
                                      setEditingMaterial(null)
                                      setShowMaterialModal(true)
                                    }}
                                    variant="secondary"
                                    size="sm"
                                    icon={Plus}
                                    className="shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    Add Material
                                  </Button>
                                </motion.div>

                                {/* Add Quiz Dropdown Button */}
                                <motion.div
                                  className="relative"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActiveMenuId(activeMenuId === `add-quiz-${topic.id}` ? null : `add-quiz-${topic.id}`)
                                    }}
                                    variant="primary"
                                    size="sm"
                                    icon={Award}
                                    className="shadow-sm hover:shadow-md transition-shadow bg-purple-600 hover:bg-purple-700"
                                  >
                                    Add Quiz
                                  </Button>

                                  {/* Quiz Options Dropdown */}
                                  {activeMenuId === `add-quiz-${topic.id}` && (
                                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleOpenGenerateModal(topic.id)
                                          setActiveMenuId(null)
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-purple-50 text-sm text-gray-700 flex items-center gap-3 transition-colors border-b border-gray-100"
                                      >
                                        <Sparkles size={16} className="text-purple-600" />
                                        <div>
                                          <div className="font-medium">AI Quiz Generator</div>
                                          <div className="text-xs text-gray-500">Auto-generate from content</div>
                                        </div>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleOpenMCQUploadModal(topic.id)
                                          setActiveMenuId(null)
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-purple-50 text-sm text-gray-700 flex items-center gap-3 transition-colors"
                                      >
                                        <Edit size={16} className="text-purple-600" />
                                        <div>
                                          <div className="font-medium">Manual Quiz Builder</div>
                                          <div className="text-xs text-gray-500">Create questions manually</div>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteTopic(topic.id)
                                    }}
                                    variant="danger"
                                    size="sm"
                                    icon={Trash2}
                                    className="shadow-sm hover:shadow-md transition-shadow"
                                  />
                                </motion.div>
                              </>
                            )}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="p-2 rounded-full hover:bg-purple-100 transition-colors"
                            >
                              <ChevronDown size={24} className="text-gray-600" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Materials Display - Animated Collapse */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="border-t border-gray-200 p-5 bg-gradient-to-br from-gray-50 to-purple-50/20">
                                {topic.description && (
                                  <motion.p
                                    className="text-sm text-gray-700 mb-4 p-3 bg-white/60 rounded-lg border border-purple-100"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    {topic.description}
                                  </motion.p>
                                )}

                                {topicMaterials.length === 0 ? (
                                  <motion.p
                                    className="text-sm text-gray-500 text-center py-6 bg-white/50 rounded-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    No materials added yet
                                  </motion.p>
                                ) : (
                                  <motion.div
                                    className="space-y-3"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                  >
                                    {topicMaterials.map((material, matIndex) => {
                                      const iconData = getMaterialIcon(material.materialType)
                                      const isLocked = isStudent && !isEnrolled

                                      return (
                                        <motion.div
                                          key={material.id}
                                          className={`relative flex items-center justify-between p-4 bg-white rounded-xl border-2 transition-all duration-300 group ${isLocked
                                            ? 'opacity-60 cursor-not-allowed border-gray-200'
                                            : 'hover:border-purple-300 hover:shadow-lg cursor-pointer border-gray-200'
                                            }`}
                                          onClick={() => handleMaterialClick(material, topic.id)}
                                          variants={fadeInUp}
                                          whileHover={!isLocked ? { y: -2, scale: 1.01 } : {}}
                                          transition={{ type: "spring", stiffness: 300 }}
                                        >
                                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                                            {/* Completion Checkbox */}
                                            {isStudent && isEnrolled && (
                                              <motion.div
                                                onClick={(e) => {
                                                  const isTimerRestricted = material.materialType === 'VIDEO' || ((material.materialType === 'PDF' || material.materialType === 'TEXT') && material.durationMinutes > 0);
                                                  if (!isTimerRestricted) {
                                                    handleToggleMaterial(material.id, e);
                                                  }
                                                }}
                                                className={`cursor-pointer transition-all duration-300 ${(material.materialType === 'VIDEO' || ((material.materialType === 'PDF' || material.materialType === 'TEXT') && material.durationMinutes > 0))
                                                  ? (completedMaterialIds.has(material.id) ? "text-green-500 cursor-default" : "text-gray-300 cursor-default")
                                                  : "text-gray-400 hover:text-green-500 hover:scale-110"
                                                  }`}
                                                title={
                                                  (material.materialType === 'VIDEO' || ((material.materialType === 'PDF' || material.materialType === 'TEXT') && material.durationMinutes > 0))
                                                    ? (completedMaterialIds.has(material.id) ? "Completed" : "View content to complete")
                                                    : (completedMaterialIds.has(material.id) ? "Mark as incomplete" : "Mark as done")
                                                }
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                              >
                                                {completedMaterialIds.has(material.id) ? (
                                                  <CheckCircle
                                                    size={26}
                                                    className="text-green-500 fill-green-100"
                                                  />
                                                ) : (
                                                  <Circle
                                                    size={26}
                                                    className="text-gray-300 group-hover:text-purple-300 transition-colors"
                                                  />
                                                )}
                                              </motion.div>
                                            )}

                                            {/* Material Icon */}
                                            <motion.div
                                              className={`${iconData.bg} p-3 rounded-xl relative flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}
                                              whileHover={{ rotate: 5, scale: 1.05 }}
                                            >
                                              <div className={iconData.color}>
                                                {iconData.component}
                                              </div>
                                              {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm">
                                                  <Lock size={16} className="text-gray-700" />
                                                </div>
                                              )}
                                            </motion.div>

                                            {/* Material Info */}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900 truncate group-hover:text-purple-900 transition-colors">
                                                  {material.title}
                                                </p>
                                                {isLocked && (
                                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex-shrink-0 font-medium">
                                                    🔒 Locked
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                                <span className="capitalize font-medium px-2 py-0.5 bg-gray-100 rounded-full">
                                                  {material.materialType.toLowerCase()}
                                                </span>
                                                {material.durationMinutes && (
                                                  <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                      <Clock size={12} />
                                                      {material.durationMinutes} min
                                                    </span>
                                                  </>
                                                )}
                                                {material.responsible && (
                                                  <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[100px]">{material.responsible}</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Instructor Actions */}
                                          {isInstructor && (
                                            <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
                                              <button
                                                onClick={() => setActiveMenuId(activeMenuId === material.id ? null : material.id)}
                                                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                              >
                                                <MoreVertical size={18} />
                                              </button>

                                              {activeMenuId === material.id && (
                                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                  <button
                                                    onClick={() => handleEditMaterial(material, topic.id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 flex items-center gap-2 transition-colors"
                                                  >
                                                    <Edit size={14} className="text-purple-600" /> Edit
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      handleDeleteMaterial(material.id, topic.id)
                                                      setActiveMenuId(null)
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 transition-colors"
                                                  >
                                                    <Trash2 size={14} /> Delete
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </motion.div>
                                      )
                                    })}
                                  </motion.div>
                                )}

                                {/* Quiz Section - Display Quiz if exists for this topic */}
                                {topicQuizzes[topic.id] && (
                                  <motion.div
                                    className="mt-4 pt-4 border-t border-purple-200"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                                        <Award size={18} className="text-purple-600" />
                                        Quiz Assessment
                                      </h4>
                                    </div>

                                    <motion.div
                                      className={`relative flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 transition-all duration-300 group ${isStudent && !isEnrolled
                                        ? 'opacity-60 cursor-not-allowed border-purple-200'
                                        : 'hover:border-purple-400 hover:shadow-lg cursor-pointer border-purple-300'
                                        }`}
                                      onClick={() => handleQuizClick(topic)}
                                      whileHover={isStudent && !isEnrolled ? {} : { y: -2, scale: 1.01 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      <div className="flex items-center space-x-4 flex-1">
                                        {/* Quiz Icon */}
                                        <motion.div
                                          className="bg-purple-100 p-3 rounded-xl relative flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
                                          whileHover={{ rotate: 5, scale: 1.05 }}
                                        >
                                          <Award size={24} className="text-purple-600" />
                                          {isStudent && !isEnrolled && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm">
                                              <Lock size={16} className="text-gray-700" />
                                            </div>
                                          )}
                                        </motion.div>

                                        {/* Quiz Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 truncate group-hover:text-purple-900 transition-colors">
                                              {topicQuizzes[topic.id].title}
                                            </p>
                                            {isStudent && !isEnrolled && (
                                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex-shrink-0 font-medium">
                                                🔒 Locked
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                            <span className="capitalize font-medium px-2 py-0.5 bg-purple-100 rounded-full">
                                              Quiz
                                            </span>
                                            {topicQuizzes[topic.id].duration && (
                                              <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                  <Clock size={12} />
                                                  {topicQuizzes[topic.id].duration} min
                                                </span>
                                              </>
                                            )}
                                            {topicQuizzes[topic.id].questions?.length && (
                                              <>
                                                <span>•</span>
                                                <span>{topicQuizzes[topic.id].questions.length} questions</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Instructor Actions for Quiz */}
                                      {isInstructor && (
                                        <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => setActiveMenuId(activeMenuId === `quiz-${topic.id}` ? null : `quiz-${topic.id}`)}
                                            className="p-1.5 hover:bg-purple-100 rounded-full text-gray-500 transition-colors"
                                          >
                                            <MoreVertical size={18} />
                                          </button>

                                          {activeMenuId === `quiz-${topic.id}` && (
                                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                              <button
                                                onClick={() => handleEditQuiz(topicQuizzes[topic.id], topic.id)}
                                                className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 flex items-center gap-2 transition-colors"
                                              >
                                                <Edit size={14} className="text-purple-600" /> Edit
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleDeleteQuiz(topicQuizzes[topic.id].id, topic.id)
                                                  setActiveMenuId(null)
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 transition-colors"
                                              >
                                                <Trash2 size={14} /> Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </motion.div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Review Section */}
          <div id="review-section" className="scroll-mt-20">
            <ReviewSection courseId={courseId} user={user} isEnrolled={isEnrolled} />
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  {course.accessRule === 'ON_PAYMENT' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{course.price?.toFixed(2)}
                      </span>
                      {/* Show a "fake" original price (20% higher) to indicate offer/value if user wants "instructor amount" struck out */}
                      <span className="text-sm font-medium text-gray-500 line-through">
                        ₹{((course.price || 0) * 1.25).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        20% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  )}
                </div>
                {course.accessRule === 'ON_PAYMENT' ? (
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <IndianRupee size={24} className="text-yellow-600" />
                  </div>
                ) : (
                  <Award size={32} className="text-yellow-500" />
                )}
              </div>

              {/* ENROLL / BUY BUTTON */}
              {isEnrolled ? (
                <Button variant="success" size="lg" className="w-full" icon={Play}>
                  Continue Learning
                </Button>
              ) : (
                // Show if Student OR Guest (not authenticated)
                // Instructors/Admins don't see Buy button usually, but if needed we can remove check
                (!user || user.role === 'STUDENT') && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className={`w-full py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 
                      ${course.accessRule === 'ON_PAYMENT'
                        ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 text-white hover:shadow-xl hover:-translate-y-1'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white hover:shadow-xl hover:-translate-y-1'
                      } 
                      flex items-center justify-center space-x-2 font-bold text-lg
                      ${enrolling ? 'opacity-70 cursor-wait' : ''}
                    `}
                  >
                    {enrolling ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        {course.accessRule === 'ON_PAYMENT' ? <IndianRupee size={22} /> : course.accessRule === 'ON_INVITATION' ? <Lock size={22} /> : null}
                        <span>
                          {course.accessRule === 'ON_PAYMENT' ? `Buy Now for ₹${course.price?.toFixed(2)}` :
                            course.accessRule === 'ON_INVITATION' ? 'Request Access' :
                              'Enroll Now - It\'s Free!'}
                        </span>
                        {course.accessRule === 'ON_PAYMENT' && <Sparkles size={20} className="text-yellow-300 animate-pulse ml-1" />}
                      </>
                    )}
                  </button>
                )
              )}

              {/* Progress Summary Box */}
              {isStudent && isEnrolled && courseProgress && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 text-lg">
                      {Math.round(courseProgress.percentage)}% Completed
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-300 rounded-full overflow-hidden mb-4 border border-gray-300">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${courseProgress.percentage}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-handwriting">
                    <div className="p-2 bg-white rounded-md border border-gray-300 shadow-sm">
                      <div className="text-xl font-bold text-gray-800">{courseProgress.totalTopics}</div>
                      <div className="text-xs font-semibold text-gray-600">Content</div>
                    </div>
                    <div className="p-2 bg-white rounded-md border border-gray-300 shadow-sm">
                      <div className="text-xl font-bold text-gray-800">{courseProgress.completedTopics}</div>
                      <div className="text-xs font-semibold text-gray-600">Completed</div>
                    </div>
                    <div className="p-2 bg-white rounded-md border border-gray-300 shadow-sm">
                      <div className="text-xl font-bold text-gray-800">{Math.max(0, courseProgress.totalTopics - courseProgress.completedTopics)}</div>
                      <div className="text-xs font-semibold text-gray-600">Incomplete</div>
                    </div>
                  </div>
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
        </div >
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
      {/* Material Modal (A4 Multi-Tab Editor) */}
      {
        showMaterialModal && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 transition-all duration-300">
            <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border-2 border-purple-400 shadow-xl rounded-2xl bg-white/90 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMaterial ? 'Edit Material' : 'Add Material'}
                </h3>
                <button onClick={closeMaterialModal}>
                  <X size={24} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              {/* TABS HEADER */}
              <div className="flex border-b border-gray-200 mb-6">
                {['CONTENT', 'DESCRIPTION', 'ATTACHMENTS'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMaterialModalTab(tab)}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${materialModalTab === tab
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    {materialModalTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              <form onSubmit={handleMaterialSubmit} className="space-y-6">

                {/* --- TAB: CONTENT --- */}
                <div className={materialModalTab === 'CONTENT' ? 'block' : 'hidden'}>
                  <div className="space-y-4">
                    {/* Row 1: Type & Title */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={materialForm.type}
                          onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          disabled={!!editingMaterial} // Prevent type change on edit to simplify logic
                        >
                          <option value="VIDEO">Video</option>
                          <option value="PDF">Document</option>
                          <option value="LINK">Link</option>
                        </select>
                        {editingMaterial && <p className="text-xs text-gray-400 mt-1">Type cannot be changed</p>}
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          label="Title"
                          value={materialForm.title}
                          onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                          required
                          placeholder="Lesson title"
                        />
                      </div>
                    </div>

                    {/* Row 2: Responsible & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Responsible Person (Optional)"
                        value={materialForm.responsible}
                        onChange={(e) => setMaterialForm({ ...materialForm, responsible: e.target.value })}
                        placeholder="e.g. Instructor Name"
                      />
                      <Input
                        label="Duration (Minutes) (Optional)"
                        type="number"
                        value={materialForm.durationMinutes}
                        onChange={(e) => setMaterialForm({ ...materialForm, durationMinutes: e.target.value })}
                        placeholder="e.g. 15"
                      />
                    </div>

                    {/* Row 3: Type Specific Input */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      {materialForm.type === 'LINK' ? (
                        <Input
                          label="External Link URL"
                          value={materialForm.link}
                          onChange={(e) => setMaterialForm({ ...materialForm, link: e.target.value })}
                          placeholder="https://..."
                          required
                        />
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {editingMaterial ? 'Replace File (Optional)' : 'Upload File'}
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })}
                              accept={materialForm.type === 'VIDEO' ? 'video/*' : 'application/pdf'}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                              required={!editingMaterial && !materialForm.file} // Required only on create if no file selected
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Max size: {materialForm.type === 'VIDEO' ? '500MB' : '50MB'}
                          </p>
                          {/* Show selected file name if present (persisted across tab switches) */}
                          {materialForm.file && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Selected: {materialForm.file.name}
                            </p>
                          )}

                          {/* Allow Download Toggle for PDF */}
                          {materialForm.type === 'PDF' && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="checkbox"
                                id="allowDownload"
                                checked={materialForm.allowDownload}
                                onChange={(e) => setMaterialForm({ ...materialForm, allowDownload: e.target.checked })}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <label htmlFor="allowDownload" className="text-sm text-gray-700">Allow students to download this file</label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- TAB: DESCRIPTION --- */}
                <div className={materialModalTab === 'DESCRIPTION' ? 'block' : 'hidden'}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Description</label>
                    <textarea
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                      rows="8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none font-normal text-gray-600 leading-relaxed"
                      placeholder="Describe what this lesson covers..."
                    />
                  </div>
                </div>

                {/* --- TAB: ATTACHMENTS --- */}
                <div className={materialModalTab === 'ATTACHMENTS' ? 'block' : 'hidden'}>
                  <div className="space-y-6">
                    {/* Existing Attachments */}
                    {materialForm.existingAttachments && materialForm.existingAttachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Current Attachments</h4>
                        <div className="space-y-2">
                          {materialForm.existingAttachments.map(att => (
                            <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3 overflow-hidden">
                                {att.externalUrl ? <LinkIcon size={16} className="text-blue-500" /> : <File size={16} className="text-gray-500" />}
                                <a href={att.externalUrl || att.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                                  {att.fileName || att.externalUrl}
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(att.id)}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                title="Remove attachment"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Attachments List */}
                    {newAttachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-green-700 mb-2">New Attachments (Unsaved)</h4>
                        <div className="space-y-2">
                          {newAttachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                              <div className="flex items-center gap-3 overflow-hidden">
                                {att.link ? <LinkIcon size={16} className="text-blue-500" /> : <File size={16} className="text-gray-500" />}
                                <span className="text-sm text-gray-700 truncate">
                                  {att.file ? att.file.name : att.link}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewAttachments(prev => prev.filter((_, i) => i !== idx))}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Attachment Form */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <label className="block text-sm font-bold text-blue-900 mb-3">Add Extra Resource</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="file"
                            className="flex-1 text-sm text-gray-500 bg-white border border-blue-200 rounded-lg p-2"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                setNewAttachments([...newAttachments, { file: e.target.files[0] }])
                                e.target.value = '' // reset input
                              }
                            }}
                          />
                        </div>
                        <div className="text-center text-xs text-gray-400 font-medium">OR</div>
                        <div className="flex gap-2">
                          <Input
                            className="flex-1 bg-white border-blue-200"
                            placeholder="Paste external link..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const val = e.target.value
                                if (val) {
                                  setNewAttachments([...newAttachments, { link: val }])
                                  e.target.value = ''
                                }
                              }
                            }}
                            id="add-link-input" // adding ID to find it manually if needed
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const el = document.getElementById('add-link-input')
                              if (el && el.value) {
                                setNewAttachments([...newAttachments, { link: el.value }])
                                el.value = ''
                              }
                            }}
                          >
                            Add Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <Button type="submit" variant="primary" className="flex-1" icon={Upload}>
                    {editingMaterial ? 'Update Lesson' : 'Create Lesson'}
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
                onClose={() => {
                  setSelectedMaterial(null);
                  fetchMaterialProgress(); // Re-fetch completed items
                  fetchTopicProgress();
                  loadProgress(courseId, topics); // Sync progress bar
                }}
                onComplete={(materialId) => {
                  console.log("Material completed callback triggered:", materialId);
                  // Update local state to show green check immediately
                  setCompletedMaterialIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(materialId);
                    return newSet;
                  });
                  // Also fetch from backend to be sure
                  fetchMaterialProgress();
                  loadProgress(courseId, topics); // Sync progress bar
                }}
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


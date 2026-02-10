import React, { useState, useEffect } from 'react'
import Card from '../../common/Card'
import Button from '../../common/Button'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, GripVertical, FileText, Video, Image as ImageIcon, Link as LinkIcon, MoreVertical, Award, Sparkles } from 'lucide-react'
import TopicModal from './TopicModal'
import LessonEditorModal from './LessonEditorModal'
import ConfirmModal from '../../common/ConfirmModal'
import { topicService } from '../../../services/topicService'
import { materialService } from '../../../services/materialService'
import { quizService } from '../../../services/quizService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ContentTab = ({ courseId }) => {
    const navigate = useNavigate()
    const [topics, setTopics] = useState([])
    const [materials, setMaterials] = useState({}) // { topicId: [materials] }
    const [quizzes, setQuizzes] = useState({}) // { topicId: quiz }
    const [loading, setLoading] = useState(true)
    const [expandedTopic, setExpandedTopic] = useState(null)

    // Modals
    const [showTopicModal, setShowTopicModal] = useState(false)
    const [editingTopic, setEditingTopic] = useState(null)

    const [showLessonModal, setShowLessonModal] = useState(false)
    const [editingLesson, setEditingLesson] = useState(null)
    const [selectedTopicId, setSelectedTopicId] = useState(null)

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'TOPIC' or 'LESSON'
        id: null,
        parentId: null, // topicId for lessons
        title: '',
        message: ''
    })

    // Menu state for lessons (3-dot menu)
    const [activeMenu, setActiveMenu] = useState(null) // lessonId

    useEffect(() => {
        fetchTopics()
    }, [courseId])

    const fetchTopics = async () => {
        try {
            setLoading(true)
            const response = await topicService.getTopicsByCourse(courseId)
            const fetchedTopics = response.data.data || response.data
            setTopics(fetchedTopics)

            // Initial load of materials and quizzes for all topics
            const materialsMap = {}
            const quizzesMap = {}
            await Promise.all(fetchedTopics.map(async (topic) => {
                const matRes = await materialService.getMaterialsByTopic(topic.id)
                materialsMap[topic.id] = matRes.data.data || matRes.data

                // Fetch quiz for this topic
                try {
                    const quizRes = await quizService.getQuizByTopic(topic.id)
                    const quiz = quizRes?.data?.data || quizRes?.data
                    if (quiz && quiz.id) {
                        quizzesMap[topic.id] = quiz
                    }
                } catch (err) {
                    // No quiz for this topic, that's okay
                }
            }))
            setMaterials(materialsMap)
            setQuizzes(quizzesMap)

        } catch (error) {
            console.error("Failed to fetch topics", error)
            toast.error("Failed to load course content")
        } finally {
            setLoading(false)
        }
    }

    const fetchMaterials = async (topicId) => {
        try {
            const res = await materialService.getMaterialsByTopic(topicId)
            setMaterials(prev => ({
                ...prev,
                [topicId]: res.data.data || res.data
            }))

            // Also fetch quiz
            try {
                const quizRes = await quizService.getQuizByTopic(topicId)
                const quiz = quizRes?.data?.data || quizRes?.data
                if (quiz && quiz.id) {
                    setQuizzes(prev => ({ ...prev, [topicId]: quiz }))
                } else {
                    setQuizzes(prev => {
                        const newQuizzes = { ...prev }
                        delete newQuizzes[topicId]
                        return newQuizzes
                    })
                }
            } catch (err) {
                // No quiz
                setQuizzes(prev => {
                    const newQuizzes = { ...prev }
                    delete newQuizzes[topicId]
                    return newQuizzes
                })
            }
        } catch (error) {
            console.error("Failed to fetch materials", error)
        }
    }

    // --- Topic Handlers ---
    const handleAddTopic = () => {
        setEditingTopic(null)
        setShowTopicModal(true)
    }

    const handleEditTopic = (topic) => {
        setEditingTopic(topic)
        setShowTopicModal(true)
    }

    const handleTopicSubmit = async (data) => {
        try {
            const payload = { ...data, courseId: Number(courseId) }

            if (editingTopic) {
                await topicService.updateTopic(editingTopic.id, payload)
                toast.success('Topic updated successfully')
            } else {
                await topicService.createTopic(payload)
                toast.success('Topic created successfully')
            }
            fetchTopics()
            setShowTopicModal(false)
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to save topic')
        }
    }

    const confirmDeleteTopic = (topic) => {
        setConfirmModal({
            isOpen: true,
            type: 'TOPIC',
            id: topic.id,
            title: `Delete Topic "${topic.name}"?`,
            message: 'Are you sure? This will delete all lessons within this topic. This action cannot be undone.'
        })
    }

    // --- Lesson Handlers ---
    const handleAddLesson = (topicId) => {
        setSelectedTopicId(topicId)
        setEditingLesson(null)
        setShowLessonModal(true)
    }

    const handleEditLesson = (lesson, topicId) => {
        setSelectedTopicId(topicId)
        setEditingLesson(lesson)
        setShowLessonModal(true)
        setActiveMenu(null) // close menu
    }

    const handleLessonSubmit = async (payload) => {
        try {
            // Check payload structure based on usage in Modal
            // LessonEditorModal returns: { title, description, type, link, file, id }

            // If ID exists -> Update
            if (payload.id) {
                // Call update endpoint
                // We need to use FormData because of file upload
                const formData = new FormData()
                formData.append('title', payload.title)
                if (payload.description) formData.append('description', payload.description)
                formData.append('materialType', payload.type)

                if (payload.file) formData.append('file', payload.file)
                if (payload.link) formData.append('link', payload.link)

                await materialService.updateMaterial(payload.id, formData)
                toast.success('Lesson updated successfully')
            } else {
                // Create
                const isLink = payload.type === 'LINK'
                if (isLink) {
                    // Create Link Material
                    const data = {
                        topicId: selectedTopicId,
                        title: payload.title,
                        description: payload.description,
                        link: payload.link
                    }
                    // MaterialService expects URLencoded probably or JSON?
                    // Controller: @PostMapping("/link") @RequestParam...
                    // So we should post as form data or params
                    const params = new URLSearchParams()
                    params.append('topicId', selectedTopicId)
                    params.append('title', payload.title)
                    if (payload.description) params.append('description', payload.description)
                    params.append('link', payload.link)

                    await materialService.createLinkMaterial(params)
                } else {
                    // Upload File Material
                    const formData = new FormData()
                    formData.append('topicId', selectedTopicId)
                    formData.append('title', payload.title)
                    if (payload.description) formData.append('description', payload.description)
                    formData.append('materialType', payload.type)
                    formData.append('file', payload.file)

                    await materialService.uploadMaterial(formData)
                }
                toast.success('Lesson added successfully')
            }

            fetchMaterials(selectedTopicId)
            setShowLessonModal(false)
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to save lesson')
        }
    }

    const confirmDeleteLesson = (lesson, topicId) => {
        setConfirmModal({
            isOpen: true,
            type: 'LESSON',
            id: lesson.id,
            parentId: topicId,
            title: `Delete Lesson "${lesson.title}"?`,
            message: 'Are you sure you want to delete this lesson? This cannot be undone.'
        })
        setActiveMenu(null)
    }

    const handleConfirmDelete = async () => {
        try {
            if (confirmModal.type === 'TOPIC') {
                await topicService.deleteTopic(confirmModal.id)
                toast.success('Topic deleted')
                fetchTopics()
            } else if (confirmModal.type === 'LESSON') {
                await materialService.deleteMaterial(confirmModal.id)
                toast.success('Lesson deleted')
                fetchMaterials(confirmModal.parentId)
            } else if (confirmModal.type === 'QUIZ') {
                await quizService.deleteQuiz(confirmModal.id)
                toast.success('Quiz deleted')
                fetchMaterials(confirmModal.parentId)
            }
            setConfirmModal({ ...confirmModal, isOpen: false })
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete item')
        }
    }

    // --- Quiz Handlers ---
    const handleAddQuizAI = (topicId) => {
        navigate(`/quiz/ai-generate/${courseId}/${topicId}`)
    }

    const handleAddQuizManual = (topicId) => {
        navigate(`/quiz/create/${courseId}/${topicId}`)
    }

    const handleEditQuiz = (quiz, topicId) => {
        navigate(`/quiz/edit/${quiz.id}`, {
            state: { quiz, topicId, courseId }
        })
    }

    const confirmDeleteQuiz = (quiz, topicId) => {
        setConfirmModal({
            isOpen: true,
            type: 'QUIZ',
            id: quiz.id,
            parentId: topicId,
            title: `Delete Quiz "${quiz.title}"?`,
            message: 'Are you sure you want to delete this quiz? This cannot be undone.'
        })
        setActiveMenu(null)
    }

    const toggleTopic = (id) => {
        setExpandedTopic(expandedTopic === id ? null : id)
    }

    // --- Render Helpers ---
    const getIcon = (type) => {
        switch (type) {
            case 'VIDEO': return <Video size={18} className="text-blue-500" />
            case 'PDF': return <FileText size={18} className="text-red-500" />
            case 'IMAGE': return <ImageIcon size={18} className="text-purple-500" />
            case 'LINK': return <LinkIcon size={18} className="text-green-500" />
            default: return <FileText size={18} className="text-gray-500" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Course Content</h2>
                <Button onClick={handleAddTopic} variant="primary" icon={Plus} size="sm">
                    Add Topic
                </Button>
            </div>

            {topics.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No content yet. Start by adding a topic.</p>
                </div>
            )}

            <div className="space-y-4">
                {topics.map((topic, index) => (
                    <Card key={topic.id} className="overflow-visible">
                        {/* Topic Header */}
                        <div
                            className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100 cursor-pointer select-none"
                            onClick={() => toggleTopic(topic.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded shadow-sm">
                                    <span className="font-bold text-gray-500">#{index + 1}</span>
                                </div>
                                <h3 className="font-medium text-gray-900">{topic.name}</h3>
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                    {(materials[topic.id] || []).length} lessons
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEditTopic(topic); }}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); confirmDeleteTopic(topic); }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="ml-2 pl-2 border-l border-gray-300">
                                    {expandedTopic === topic.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* Lessons List */}
                        {expandedTopic === topic.id && (
                            <div className="p-4 space-y-3 bg-white">
                                {materials[topic.id]?.length === 0 ? (
                                    <p className="text-sm text-center text-gray-400 py-4">No lessons in this topic yet.</p>
                                ) : (
                                    materials[topic.id]?.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all group relative">
                                            <div className="flex items-center gap-3">
                                                <GripVertical size={16} className="text-gray-300 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="p-1.5 bg-gray-50 rounded">
                                                    {getIcon(lesson.materialType)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                                    <p className="text-xs text-gray-500 uppercase">{lesson.materialType}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === lesson.id ? null : lesson.id); }}
                                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* 3-Dot Dropdown */}
                                                {activeMenu === lesson.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1 action-menu">
                                                        <button
                                                            onClick={() => handleEditLesson(lesson, topic.id)}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                                        >
                                                            <Edit size={14} className="mr-2" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDeleteLesson(lesson, topic.id)}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Quiz Section */}
                                {quizzes[topic.id] && (
                                    <div className="mt-4 pt-4 border-t border-purple-100">
                                        <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                            <Award size={16} />
                                            Quiz Assessment
                                        </h4>
                                        <div className="flex items-center justify-between p-3 border border-purple-100 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:border-purple-200 hover:shadow-sm transition-all group relative">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded">
                                                    <Award size={18} className="text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{quizzes[topic.id].title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {quizzes[topic.id].duration} min • {quizzes[topic.id].questions?.length || 0} questions
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quiz Actions */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === `quiz-${quizzes[topic.id].id}` ? null : `quiz-${quizzes[topic.id].id}`); }}
                                                    className="p-1.5 rounded-full hover:bg-purple-100 text-purple-600"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Quiz 3-Dot Dropdown */}
                                                {activeMenu === `quiz-${quizzes[topic.id].id}` && (
                                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1 action-menu">
                                                        <button
                                                            onClick={() => handleEditQuiz(quizzes[topic.id], topic.id)}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                                        >
                                                            <Edit size={14} className="mr-2" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDeleteQuiz(quizzes[topic.id], topic.id)}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 mt-3">
                                    <Button
                                        onClick={() => handleAddLesson(topic.id)}
                                        variant="outline"
                                        className="flex-1 border-dashed"
                                        size="sm"
                                        icon={Plus}
                                    >
                                        Add Content
                                    </Button>

                                    {/* Add Quiz Button with Dropdown */}
                                    {!quizzes[topic.id] && (
                                        <div className="relative flex-1">
                                            <Button
                                                onClick={() => setActiveMenu(activeMenu === `add-quiz-${topic.id}` ? null : `add-quiz-${topic.id}`)}
                                                variant="outline"
                                                className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                                                size="sm"
                                                icon={Award}
                                            >
                                                Add Quiz
                                            </Button>

                                            {/* Quiz Options Dropdown */}
                                            {activeMenu === `add-quiz-${topic.id}` && (
                                                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden">
                                                    <button
                                                        onClick={() => {
                                                            handleAddQuizAI(topic.id)
                                                            setActiveMenu(null)
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
                                                        onClick={() => {
                                                            handleAddQuizManual(topic.id)
                                                            setActiveMenu(null)
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Modals */}
            <TopicModal
                isOpen={showTopicModal}
                onClose={() => setShowTopicModal(false)}
                onSubmit={handleTopicSubmit}
                initialData={editingTopic}
            />

            <LessonEditorModal
                isOpen={showLessonModal}
                onClose={() => setShowLessonModal(false)}
                onSubmit={handleLessonSubmit}
                initialData={editingLesson}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Delete"
                variant="danger"
            />

            {/* Click outside to close menu handler - simplified via immediate click handlers but better with overlay if needed */}
            {activeMenu && (
                <div
                    className="fixed inset-0 z-0 bg-transparent"
                    onClick={() => setActiveMenu(null)}
                ></div>
            )}
        </div>
    )
}

export default ContentTab

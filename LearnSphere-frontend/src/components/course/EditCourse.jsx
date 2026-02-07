import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { courseService } from '../../services/courseService'
import { ArrowLeft, Save, Eye, UserPlus, Mail, Upload } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Loader from '../common/Loader'
import AddAttendeesModal from './AddAttendeesModal'
import ContactAttendeesModal from './ContactAttendeesModal'
import toast from 'react-hot-toast'


// Tab Components
import CourseEditTabs from './tabs/CourseEditTabs'
import BasicInfoTab from './tabs/BasicInfoTab'

import OptionsTab from './tabs/OptionsTab'
import { userService } from '../../services/userService'

const EditCourse = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [course, setCourse] = useState(null)

  // Tab State
  const [activeTab, setActiveTab] = useState('basic')

  // Shared Modals
  const [showAddAttendeesModal, setShowAddAttendeesModal] = useState(false)
  const [showContactAttendeesModal, setShowContactAttendeesModal] = useState(false)

  // Image Upload State (Passed to BasicInfoTab)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageInputMethod, setImageInputMethod] = useState('url') // 'url' or 'upload'

  // Admin Users for Options Tab
  const [adminUsers, setAdminUsers] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'BEGINNER',
    duration: '',
    thumbnailUrl: '',
    category: '',
    tags: '',
    courseAdminUserId: null,
    visibility: 'EVERYONE',
    accessRule: 'OPEN',
    price: ''
  })

  useEffect(() => {
    fetchCourseData()
    fetchAdminUsers()
  }, [id])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const response = await courseService.getCourseById(id, null)
      const courseData = response?.data?.data || response?.data || response

      setCourse(courseData)
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        difficultyLevel: courseData.difficultyLevel || 'BEGINNER',
        duration: courseData.duration || '',
        thumbnailUrl: courseData.thumbnailUrl || '',
        category: courseData.category || '',
        tags: courseData.tags || '',
        courseAdminUserId: courseData.courseAdminUserId || null,
        // Set defaults for new fields if they're null (for existing courses)
        visibility: courseData.visibility || 'EVERYONE',
        accessRule: courseData.accessRule || 'OPEN',
        price: courseData.price || ''
      })
      setImagePreview(courseData.thumbnailUrl)
      if (courseData.thumbnailUrl && !courseData.thumbnailUrl.startsWith('http')) {
        // If it's a relative path or something, we might assume upload, but URL input works for both if full path
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
      toast.error('Failed to load course details')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminUsers = async () => {
    try {
      const res = await courseService.getPotentialCourseAdmins()
      setAdminUsers(res.data || [])
    } catch (error) {
      console.error("Failed to fetch admin users", error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      setUploadingImage(true)
      const response = await courseService.uploadCourseImage(id, formDataUpload)

      const imageUrl = response.imageUrl || response
      setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }))
      setImagePreview(imageUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Validate price if access rule is ON_PAYMENT
    if (formData.accessRule === 'ON_PAYMENT') {
      if (!formData.price || formData.price <= 0) {
        toast.error('Price is required and must be greater than 0 when Access Rule is "On Payment"')
        return
      }
    }

    try {
      const payload = {
        ...formData,
        duration: Number(formData.duration) || 0,
        // Ensure category is not empty
        category: formData.category || 'General',
        // Ensure other fields are correctly formatted
      }

      console.log('Submitting payload:', payload)
      await courseService.updateCourse(id, payload)
      toast.success('Course updated successfully')
      // Optionally refresh data
      fetchCourseData()
    } catch (error) {
      console.error('Update failed:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      toast.error(error.response?.data?.message || 'Failed to update course')
    }
  }

  const handlePublishToggle = async () => {
    try {
      setPublishing(true)

      // Call dedicated publish endpoint which toggles status
      const response = await courseService.publishCourse(id)

      // Determine new status from response or toggle current
      // Ideally API returns new status. Based on backend change: ApiResponse<Boolean>
      // response.data should be the boolean status if using standard Axios, but let's check wrapper
      // Our services usually return response.data if using interceptor or wrapper unwrapping
      // Let's safe check. If endpoint returns ApiResponse object { success, message, data: boolean }

      const newStatus = response?.data === true || response?.data === false ? response.data : !course.isPublished

      setCourse({ ...course, isPublished: newStatus })
      toast.success(newStatus ? 'Course published successfully' : 'Course unpublished successfully')
    } catch (error) {
      console.error('Publish update failed:', error)
      toast.error('Failed to update publish status')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Courses</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-500 mt-1">{course?.title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {course?.isPublished ? (
            <Button
              variant="outline"
              className="text-green-600 border-green-600 bg-green-50 opacity-80 cursor-default"
              disabled={true}
            >
              Live
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={handlePublishToggle}
              disabled={publishing}
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}

          <Button
            variant="secondary"
            icon={Eye}
            onClick={() => navigate('/courses/' + id)}
          >
            Preview
          </Button>

          <Button
            variant="secondary"
            icon={UserPlus}
            onClick={() => setShowAddAttendeesModal(true)}
          >
            Add Attendees
          </Button>

          <Button
            variant="secondary"
            icon={Mail}
            onClick={() => setShowContactAttendeesModal(true)}
          >
            Contact
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* TABS */}
      <CourseEditTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* TAB CONTENT */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <BasicInfoTab
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            imageInputMethod={imageInputMethod}
            setImageInputMethod={setImageInputMethod}
            uploadingImage={uploadingImage}
            handleImageUpload={handleImageUpload}
          />
        )}



        {activeTab === 'options' && (
          <OptionsTab
            formData={formData}
            setFormData={setFormData}
            adminUsers={adminUsers}
            user={user}
          />
        )}
      </div>

      {/* Modals outside tabs */}
      <AddAttendeesModal
        isOpen={showAddAttendeesModal}
        onClose={() => setShowAddAttendeesModal(false)}
        courseId={id}
      />

      <ContactAttendeesModal
        isOpen={showContactAttendeesModal}
        onClose={() => setShowContactAttendeesModal(false)}
        courseId={id}
      />
    </div>
  )
}

export default EditCourse
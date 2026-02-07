import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { courseService } from '../../services/courseService'
import toast from 'react-hot-toast'

const initialState = {
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await courseService.getAllCourses(studentId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses')
    }
  }
)

export const fetchPublishedCourses = createAsyncThunk(
  'course/fetchPublishedCourses',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await courseService.getPublishedCourses(studentId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses')
    }
  }
)

export const fetchCourseById = createAsyncThunk(
  'course/fetchCourseById',
  async ({ id, studentId }, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseById(id, studentId)
      // Extract data from ApiResponse wrapper if needed
      return response.data?.data || response.data || response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course')
    }
  }
)

export const createCourse = createAsyncThunk(
  'course/createCourse',
  async ({ courseData, instructorId }, { rejectWithValue }) => {
    try {
      const response = await courseService.createCourse(courseData, instructorId)
      toast.success('Course created successfully!')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course')
      return rejectWithValue(error.response?.data?.message || 'Failed to create course')
    }
  }
)

export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const response = await courseService.updateCourse(id, courseData)
      toast.success('Course updated successfully!')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course')
      return rejectWithValue(error.response?.data?.message || 'Failed to update course')
    }
  }
)

export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      await courseService.deleteCourse(id)
      toast.success('Course deleted successfully!')
      return id
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course')
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course')
    }
  }
)

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearSelectedCourse: (state) => {
      state.selectedCourse = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch published courses
      .addCase(fetchPublishedCourses.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPublishedCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchPublishedCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCourse = action.payload
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false
        state.courses.push(action.payload)
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(course => course.id !== action.payload)
      })
  },
})

export const { clearSelectedCourse, clearError } = courseSlice.actions
export default courseSlice.reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { topicService } from '../../services/topicService'
import toast from 'react-hot-toast'

const initialState = {
  topics: [],
  selectedTopic: null,
  loading: false,
  error: null,
}

export const fetchTopicsByCourse = createAsyncThunk(
  'topic/fetchByCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await topicService.getTopicsByCourse(courseId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch topics')
    }
  }
)

export const createTopic = createAsyncThunk(
  'topic/create',
  async (topicData, { rejectWithValue }) => {
    try {
      const response = await topicService.createTopic(topicData)
      toast.success('Topic created successfully!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create topic')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const updateTopic = createAsyncThunk(
  'topic/update',
  async ({ topicId, topicData }, { rejectWithValue }) => {
    try {
      const response = await topicService.updateTopic(topicId, topicData)
      toast.success('Topic updated successfully!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update topic')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const deleteTopic = createAsyncThunk(
  'topic/delete',
  async (topicId, { rejectWithValue }) => {
    try {
      await topicService.deleteTopic(topicId)
      toast.success('Topic deleted successfully!')
      return topicId
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete topic')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {
    clearTopics: (state) => {
      state.topics = []
    },
    setSelectedTopic: (state, action) => {
      state.selectedTopic = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopicsByCourse.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTopicsByCourse.fulfilled, (state, action) => {
        state.loading = false
        state.topics = action.payload
      })
      .addCase(fetchTopicsByCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.topics.push(action.payload)
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        const index = state.topics.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.topics[index] = action.payload
        }
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.topics = state.topics.filter(t => t.id !== action.payload)
      })
  }
})

export const { clearTopics, setSelectedTopic } = topicSlice.actions
export default topicSlice.reducer

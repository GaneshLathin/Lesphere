import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { materialService } from '../../services/materialService'
import toast from 'react-hot-toast'

const initialState = {
  materials: [],
  loading: false,
  error: null,
}

export const fetchMaterialsByTopic = createAsyncThunk(
  'material/fetchByTopic',
  async (topicId, { rejectWithValue }) => {
    try {
      const response = await materialService.getMaterialsByTopic(topicId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials')
    }
  }
)

export const uploadMaterial = createAsyncThunk(
  'material/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await materialService.uploadMaterial(formData)
      toast.success('Material uploaded successfully!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload material')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const createLinkMaterial = createAsyncThunk(
  'material/createLink',
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await materialService.createLinkMaterial(materialData)
      toast.success('Link material created successfully!')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create link material')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const deleteMaterial = createAsyncThunk(
  'material/delete',
  async (materialId, { rejectWithValue }) => {
    try {
      await materialService.deleteMaterial(materialId)
      toast.success('Material deleted successfully!')
      return materialId
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete material')
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    clearMaterials: (state) => {
      state.materials = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterialsByTopic.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMaterialsByTopic.fulfilled, (state, action) => {
        state.loading = false
        state.materials = action.payload
      })
      .addCase(fetchMaterialsByTopic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(uploadMaterial.fulfilled, (state, action) => {
        state.materials.push(action.payload)
      })
      .addCase(createLinkMaterial.fulfilled, (state, action) => {
        state.materials.push(action.payload)
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter(m => m.id !== action.payload)
      })
  }
})

export const { clearMaterials } = materialSlice.actions
export default materialSlice.reducer
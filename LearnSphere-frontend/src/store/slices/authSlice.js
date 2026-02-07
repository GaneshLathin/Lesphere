import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

// Get initial state from localStorage
const token = localStorage.getItem('token')
const refreshToken = localStorage.getItem('refreshToken')
const user = localStorage.getItem('user')

const initialState = {
  isAuthenticated: !!token,
  user: user ? JSON.parse(user) : null,
  token: token,
  refreshToken: refreshToken,
  loading: false,
  error: null,
}

/**
 * Login async thunk with JWT authentication
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', credentials.email)
      const response = await authService.login(credentials)
      console.log('Login response:', response)

      // Backend returns ApiResponse wrapper: { success, message, data }
      const userData = response.data || response
      const { token, refreshToken, userId, studentId, name, email, role, profileImage } = userData

      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      localStorage.setItem(
        'user',
        JSON.stringify({ userId, studentId, name, email, role, profileImage })
      )

      toast.success('Login successful!')
      return {
        token,
        refreshToken,
        user: { userId, studentId, name, email, role, profileImage }
      }

    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)

      // Extract error message from different possible response structures
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        error.message ||
        'Login failed. Please check your credentials.'

      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

/**
 * Register async thunk
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)

      // Backend returns ApiResponse wrapper: { success, message, data }
      const authData = response.data || response
      const { token, refreshToken, userId, studentId, name, email, role, profileImage } = authData

      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      localStorage.setItem(
        'user',
        JSON.stringify({ userId, studentId, name, email, role, profileImage })
      )

      toast.success('Registration successful!')
      return {
        token,
        refreshToken,
        user: { userId, studentId, name, email, role, profileImage }
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
      return rejectWithValue(errorMessage)
    }
  }
)

/**
 * Refresh token async thunk
 */
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const newToken = await authService.refreshToken()
      return { token: newToken }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh token')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout()
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.refreshToken = null
      toast.success('Logged out successfully')
    },
    clearError: (state) => {
      state.error = null
    },
    updateToken: (state, action) => {
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Token refresh failed, log out user
        authService.logout()
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })
  },
})

export const { logout, clearError, updateToken, updateUser } = authSlice.actions
export default authSlice.reducer
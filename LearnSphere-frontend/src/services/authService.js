import api from './api'

/**
 * Authentication service for handling JWT authentication
 * Includes login, register, logout, token management, and refresh
 */
export const authService = {
  /**
   * Login user and store tokens
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    if (response.data?.data) {
      const { token, refreshToken } = response.data.data
      if (token) localStorage.setItem('token', token)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    }
    return response.data
  },

  /**
   * Register new user and store tokens
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    if (response.data?.data) {
      const { token, refreshToken } = response.data.data
      if (token) localStorage.setItem('token', token)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    }
    return response.data
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post('/auth/refresh', { refreshToken })
    if (response.data?.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data
      if (accessToken) localStorage.setItem('token', accessToken)
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
      return accessToken
    }
    throw new Error('Failed to refresh token')
  },

  /**
   * Logout user and clear all tokens
   */
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Get access token
   */
  getToken() {
    return localStorage.getItem('token')
  },

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken()
  }
}
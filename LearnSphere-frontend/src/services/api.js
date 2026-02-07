/* eslint-disable no-console */

import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// --------------------------- REQUEST INTERCEPTOR ---------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --------------------------- RESPONSE INTERCEPTOR ---------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config

    console.log('API ERROR:', status, error?.response?.data)

    // --------------------------- 401 TOKEN EXPIRED ---------------------------
    if (status === 401 && originalRequest && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      // If no refresh token, user is effectively logged out. 
      // Just redirect quietly (or showing one message is up to calling code, but here we enforce cleanup).
      // We check window.location.pathname to avoid infinite reload loop if already on /login
      if (!refreshToken) {
        localStorage.clear()
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login')
        }
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        localStorage.setItem('token', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false

        localStorage.clear()

        // Prevent duplicate toasts if multiple requests fail simultaneously
        if (!document.querySelector('.go3958317564')) { // Check for existing toast via class (approximate) or just rely on react-hot-toast's deduping if configured, but simplified here:
          toast.error('Session expired. Please log in again.', { id: 'session-expired' })
        }

        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login')
        }

        return Promise.reject(refreshError)
      }
    }

    // --------------------------- 403 FORBIDDEN ---------------------------
    if (status === 403) {
      toast.error(
        error?.response?.data?.message ||
        "You don't have permission to perform this action."
      )
    }

    // --------------------------- 500 SERVER ERROR ---------------------------
    if (typeof status === 'number' && status >= 500) {
      toast.error('Server error. Try again later.')
    }

    return Promise.reject(error)
  }
)

export default api

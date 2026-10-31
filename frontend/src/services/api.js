import axios from 'axios'

// Create Axios client with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicsense_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle global errors (e.g., token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected endpoint, clear stale token
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/login')
      if (!isAuthEndpoint) {
        console.warn('Authentication token expired or invalid. Clearing session.')
        localStorage.removeItem('civicsense_token')
        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        window.dispatchEvent(new CustomEvent('civicsense-unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

export default api

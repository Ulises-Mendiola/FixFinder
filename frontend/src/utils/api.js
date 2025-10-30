import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('fixfinder_auth')
  if (stored) {
    try {
      const { token } = JSON.parse(stored)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Invalid auth storage, cleaning up', error)
      localStorage.removeItem('fixfinder_auth')
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fixfinder_auth')
    }
    return Promise.reject(error)
  },
)

export default api

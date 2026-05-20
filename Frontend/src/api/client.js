import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request if present
client.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const registerUser = (email, password) => client.post('/auth/register', { email, password })
export const loginUser = (email, password) => client.post('/auth/login', { email, password })
export const getMe = () => client.get('/auth/me')

// Profile
export const getProfile = () => client.get('/profile/me')
export const setupProfile = (data) => client.post('/profile/setup', data)

// Applications
export const getApplications = () => client.get('/applications/')
export const createApplication = (data) => client.post('/applications/', data)
export const updateApplication = (id, data) => client.put(`/applications/${id}`, data)
export const deleteApplication = (id) => client.delete(`/applications/${id}`)

// Analytics
export const getAnalyticsSummary = () => client.get('/analytics/summary')

// AI
export const getInterviewPrep = (job_description) => client.post('/ai/interview-prep', { job_description })
export const getFitScore = (job_description) => client.post('/ai/fit-score', { job_description })

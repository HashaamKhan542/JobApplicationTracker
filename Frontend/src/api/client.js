import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const getApplications = () => client.get('/applications/')
export const createApplication = (data) => client.post('/applications/', data)
export const updateApplication = (id, data) => client.put(`/applications/${id}`, data)
export const deleteApplication = (id) => client.delete(`/applications/${id}`)
export const getAnalyticsSummary = () => client.get('/analytics/summary')
export const getInterviewPrep = (job_description) => client.post('/ai/interview-prep', { job_description })
export const getFitScore = (job_description) => client.post('/ai/fit-score', { job_description })
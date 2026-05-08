import axios from 'axios'
import * as mock from './mockApi'

const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL

const rawApiUrl = import.meta.env.VITE_API_URL || '/api'
const normalizedApiUrl = rawApiUrl.replace(/\/$/, '')
const baseURL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Attach token from localStorage to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Global response error handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────
export const authApi = useMock ? mock.mockAuthApi : {
  login:    (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout:   ()   => api.post('/auth/logout'),
  me:       ()   => api.get('/auth/me'),
  updateMe: (data: any) => api.put('/auth/me', data),
  changePassword: (data: any) => api.put('/auth/password', data),
}

// ── Todos ─────────────────────────────────────────
export const todoApi = useMock ? mock.mockTodoApi : {
  list:       (params: any) => api.get('/todos', { params }),
  today:      ()     => api.get('/todos/today'),
  pinned:     ()     => api.get('/todos/pinned'),
  get:        (id: any)     => api.get(`/todos/${id}`),
  create:     (data: any)   => api.post('/todos', data),
  update:     (id: any, data: any) => api.put(`/todos/${id}`, data),
  remove:     (id: any)     => api.delete(`/todos/${id}`),
  complete:   (id: any)     => api.patch(`/todos/${id}/complete`),
  pin:        (id: any)     => api.patch(`/todos/${id}/pin`),
  // Sub-tasks
  addSubTask:    (id: any, data: any) => api.post(`/todos/${id}/sub-tasks`, data),
  toggleSubTask: (id: any, sid: any)  => api.patch(`/todos/${id}/sub-tasks/${sid}`),
  removeSubTask: (id: any, sid: any)  => api.delete(`/todos/${id}/sub-tasks/${sid}`),
}

// ── Reminders ─────────────────────────────────────
export const reminderApi = useMock ? mock.mockReminderApi : {
  get:     (id: any)     => api.get(`/todos/${id}/reminder`),
  upsert:  (id: any, data: any) => api.post(`/todos/${id}/reminder`, data),
  toggle:  (id: any)     => api.patch(`/todos/${id}/reminder/toggle`),
  remove:  (id: any)     => api.delete(`/todos/${id}/reminder`),
}

// ── Groups ────────────────────────────────────────
export const groupApi = useMock ? mock.mockGroupApi : {
  list:   ()           => api.get('/groups'),
  create: (data: any)         => api.post('/groups', data),
  update: (id: any, data: any)   => api.put(`/groups/${id}`, data),
  remove: (id: any)           => api.delete(`/groups/${id}`),
}

// ── Labels ────────────────────────────────────────
export const labelApi = useMock ? mock.mockLabelApi : {
  list:   ()           => api.get('/labels'),
  create: (data: any)         => api.post('/labels', data),
  update: (id: any, data: any)   => api.put(`/labels/${id}`, data),
  remove: (id: any)           => api.delete(`/labels/${id}`),
}

// ── Milestones ────────────────────────────────────
export const milestoneApi = useMock ? mock.mockMilestoneApi : {
  list:   ()           => api.get('/milestones'),
  create: (data: any)         => api.post('/milestones', data),
  update: (id: any, data: any)   => api.put(`/milestones/${id}`, data),
  remove: (id: any)           => api.delete(`/milestones/${id}`),
  progress: (id: any, v: any)    => api.patch(`/milestones/${id}/progress`, { progress: v }),
}

// ── Notes (Encrypted) ─────────────────────────────
export const noteApi = useMock ? mock.mockNoteApi : {
  list:    (params: any)      => api.get('/notes', { params }),
  get:     (id: any)          => api.get(`/notes/${id}`),
  create:  (data: any)        => api.post('/notes', data),
  update:  (id: any, data: any)  => api.put(`/notes/${id}`, data),
  remove:  (id: any)          => api.delete(`/notes/${id}`),
  restore: (id: any)          => api.post(`/notes/${id}/restore`),
  archive: (id: any)          => api.post(`/notes/${id}/archive`),
  pin:     (id: any)          => api.post(`/notes/${id}/pin`),
}

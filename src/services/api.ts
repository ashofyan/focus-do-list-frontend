import axios from 'axios'

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
export const authApi = {
  login:    data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  logout:   ()   => api.post('/auth/logout'),
  me:       ()   => api.get('/auth/me'),
  updateMe: data => api.put('/auth/me', data),
  changePassword: data => api.put('/auth/password', data),
}

// ── Todos ─────────────────────────────────────────
export const todoApi = {
  list:       params => api.get('/todos', { params }),
  today:      ()     => api.get('/todos/today'),
  pinned:     ()     => api.get('/todos/pinned'),
  get:        id     => api.get(`/todos/${id}`),
  create:     data   => api.post('/todos', data),
  update:     (id, data) => api.put(`/todos/${id}`, data),
  remove:     id     => api.delete(`/todos/${id}`),
  complete:   id     => api.patch(`/todos/${id}/complete`),
  pin:        id     => api.patch(`/todos/${id}/pin`),
  // Sub-tasks
  addSubTask:    (id, data) => api.post(`/todos/${id}/sub-tasks`, data),
  toggleSubTask: (id, sid)  => api.patch(`/todos/${id}/sub-tasks/${sid}`),
  removeSubTask: (id, sid)  => api.delete(`/todos/${id}/sub-tasks/${sid}`),
}

// ── Reminders ─────────────────────────────────────
export const reminderApi = {
  get:     id     => api.get(`/todos/${id}/reminder`),
  upsert:  (id, data) => api.post(`/todos/${id}/reminder`, data),
  toggle:  id     => api.patch(`/todos/${id}/reminder/toggle`),
  remove:  id     => api.delete(`/todos/${id}/reminder`),
}

// ── Groups ────────────────────────────────────────
export const groupApi = {
  list:   ()           => api.get('/groups'),
  create: data         => api.post('/groups', data),
  update: (id, data)   => api.put(`/groups/${id}`, data),
  remove: id           => api.delete(`/groups/${id}`),
}

// ── Labels ────────────────────────────────────────
export const labelApi = {
  list:   ()           => api.get('/labels'),
  create: data         => api.post('/labels', data),
  update: (id, data)   => api.put(`/labels/${id}`, data),
  remove: id           => api.delete(`/labels/${id}`),
}

// ── Milestones ────────────────────────────────────
export const milestoneApi = {
  list:   ()           => api.get('/milestones'),
  create: data         => api.post('/milestones', data),
  update: (id, data)   => api.put(`/milestones/${id}`, data),
  remove: id           => api.delete(`/milestones/${id}`),
  progress: (id, v)    => api.patch(`/milestones/${id}/progress`, { progress: v }),
}

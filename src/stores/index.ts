import { create } from 'zustand'
import { authApi } from '../services/api'

export type User = {
  id?: number
  name?: string
  email?: string
  timezone?: string
  [key: string]: unknown
}

type RegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token, loading: false })
  },

  register: async (payload) => {
    set({ loading: true })
    const { data } = await authApi.register(payload)
    localStorage.setItem('token', data.token)
    set({ user: data.user, token: data.token, loading: false })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Logout should still clear local auth state if the API call fails.
    }
    localStorage.removeItem('token')
    set({ user: null, token: null, loading: false })
  },

  fetchMe: async () => {
    try {
      const { data } = await authApi.me()
      set({ user: data })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
    }
  },

  setUser: (user) => set({ user }),
}))

type ToastType = 'default' | 'success' | 'error'

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastState = {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => number
  remove: (id: number) => void
  success: (message: string) => number
  error: (message: string) => number
}

let toastId = 0

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  add: (message, type = 'default') => {
    const id = ++toastId
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().remove(id), 3500)
    return id
  },

  remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  success: (message) => get().add(message, 'success'),
  error: (message) => get().add(message, 'error'),
}))

type TodoModalMode = null | 'create' | number | { id: number }

type UiState = {
  sidebarOpen: boolean
  todoModal: TodoModalMode
  selectedDate: Date
  toggleSidebar: () => void
  openTodoModal: (mode: TodoModalMode) => void
  closeTodoModal: () => void
  setDate: (date: Date) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  todoModal: null,
  selectedDate: new Date(),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openTodoModal: (mode) => set({ todoModal: mode }),
  closeTodoModal: () => set({ todoModal: null }),
  setDate: (date) => set({ selectedDate: date }),
}))

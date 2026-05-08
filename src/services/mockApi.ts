import { User, Todo, Milestone, Group, Label, EncryptedNote } from '../types'

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(res => setTimeout(res, ms))

// Storage helpers
const STORAGE_KEYS = {
  TODOS: 'mock_todos',
  GROUPS: 'mock_groups',
  LABELS: 'mock_labels',
  MILESTONES: 'mock_milestones',
  NOTES: 'mock_notes',
  USER: 'mock_user',
  TOKEN: 'token'
}

const getStored = <T>(key: string, def: T): T => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : def
}

const setStored = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// Initial Data
const INITIAL_GROUPS: Group[] = [
  { id: 1, name: 'Work', color: '#3b82f6' },
  { id: 2, name: 'Personal', color: '#10b981' },
  { id: 3, name: 'Health', color: '#ef4444' },
]

const INITIAL_LABELS: Label[] = [
  { id: 1, name: 'Urgent' },
  { id: 2, name: 'Later' },
]

const INITIAL_USER: User = {
  id: 1,
  name: 'Demo User',
  email: 'demo@example.com',
  timezone: 'UTC'
}

// Mock implementation
export const mockAuthApi = {
  login: async (data: any) => {
    await delay()
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_token_xyz')
    return { data: { token: 'mock_token_xyz', user: INITIAL_USER } }
  },
  register: async (data: any) => {
    await delay()
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_token_xyz')
    return { data: { token: 'mock_token_xyz', user: { ...INITIAL_USER, ...data } } }
  },
  logout: async () => {
    await delay()
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    return { data: { message: 'Logged out' } }
  },
  me: async () => {
    await delay(100)
    return { data: { data: getStored(STORAGE_KEYS.USER, INITIAL_USER) } }
  },
  updateMe: async (data: any) => {
    await delay()
    const user = { ...getStored(STORAGE_KEYS.USER, INITIAL_USER), ...data }
    setStored(STORAGE_KEYS.USER, user)
    return { data: { data: user } }
  },
  changePassword: async (data: any) => {
    await delay()
    return { data: { message: 'Password updated' } }
  }
}

export const mockTodoApi = {
  list: async (params: any) => {
    await delay(200)
    let todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    if (params?.date) {
      todos = todos.filter(t => t.due_date?.startsWith(params.date))
    }
    return { data: { data: todos } }
  },
  today: async () => {
    await delay(200)
    const today = new Date().toISOString().split('T')[0]
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, []).filter(t => t.due_date?.startsWith(today))
    return { data: { data: todos } }
  },
  pinned: async () => {
    await delay(100)
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, []).filter(t => t.is_pinned)
    return { data: { data: todos } }
  },
  get: async (id: number) => {
    await delay(100)
    const todo = getStored<Todo[]>(STORAGE_KEYS.TODOS, []).find(t => t.id === Number(id))
    return { data: { data: todo } }
  },
  create: async (data: any) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const newTodo: Todo = {
      ...data,
      id: Date.now(),
      status: data.status || 'pending',
      is_pinned: data.is_pinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    todos.push(newTodo)
    setStored(STORAGE_KEYS.TODOS, todos)
    return { data: { data: newTodo } }
  },
  update: async (id: number, data: any) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      todos[idx] = { ...todos[idx], ...data, updated_at: new Date().toISOString() }
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx] } }
  },
  remove: async (id: number) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, []).filter(t => t.id !== Number(id))
    setStored(STORAGE_KEYS.TODOS, todos)
    return { data: { message: 'Deleted' } }
  },
  complete: async (id: number) => {
    await delay(100)
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      todos[idx].status = todos[idx].status === 'completed' ? 'pending' : 'completed'
      todos[idx].updated_at = new Date().toISOString()
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx] } }
  },
  pin: async (id: number) => {
    await delay(100)
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      todos[idx].is_pinned = !todos[idx].is_pinned
      todos[idx].updated_at = new Date().toISOString()
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx] } }
  },
  addSubTask: async (id: number, data: any) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      const subTasks = todos[idx].sub_tasks || []
      const newSub = { ...data, id: Date.now(), status: 'pending' }
      subTasks.push(newSub)
      todos[idx].sub_tasks = subTasks
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx] } }
  },
  toggleSubTask: async (id: number, sid: number) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      const subTasks = todos[idx].sub_tasks || []
      const sidx = subTasks.findIndex((s: any) => s.id === Number(sid))
      if (sidx !== -1) {
        subTasks[sidx].status = subTasks[sidx].status === 'completed' ? 'pending' : 'completed'
      }
      todos[idx].sub_tasks = subTasks
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx] } }
  },
  removeSubTask: async (id: number, sid: number) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      todos[idx].sub_tasks = (todos[idx].sub_tasks || []).filter((s: any) => s.id !== Number(sid))
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx] } }
  }
}

export const mockReminderApi = {
  get: async (id: number) => {
    await delay(100)
    const todo = getStored<Todo[]>(STORAGE_KEYS.TODOS, []).find(t => t.id === Number(id))
    return { data: { data: todo?.reminder } }
  },
  upsert: async (id: number, data: any) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      todos[idx].reminder = { ...data, is_active: true }
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx].reminder } }
  },
  toggle: async (id: number) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1 && todos[idx].reminder) {
      todos[idx].reminder.is_active = !todos[idx].reminder.is_active
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { data: todos[idx]?.reminder } }
  },
  remove: async (id: number) => {
    await delay()
    const todos = getStored<Todo[]>(STORAGE_KEYS.TODOS, [])
    const idx = todos.findIndex(t => t.id === Number(id))
    if (idx !== -1) {
      delete todos[idx].reminder
      setStored(STORAGE_KEYS.TODOS, todos)
    }
    return { data: { message: 'Deleted' } }
  }
}

export const mockGroupApi = {
  list: async () => {
    await delay(100)
    return { data: { data: getStored(STORAGE_KEYS.GROUPS, INITIAL_GROUPS) } }
  },
  create: async (data: any) => {
    await delay()
    const groups = getStored<Group[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS)
    const newGroup = { ...data, id: Date.now() }
    groups.push(newGroup)
    setStored(STORAGE_KEYS.GROUPS, groups)
    return { data: { data: newGroup } }
  },
  update: async (id: number, data: any) => {
    await delay()
    const groups = getStored<Group[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS)
    const idx = groups.findIndex(g => g.id === Number(id))
    if (idx !== -1) {
      groups[idx] = { ...groups[idx], ...data }
      setStored(STORAGE_KEYS.GROUPS, groups)
    }
    return { data: { data: groups[idx] } }
  },
  remove: async (id: number) => {
    await delay()
    const groups = getStored<Group[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS).filter(g => g.id !== Number(id))
    setStored(STORAGE_KEYS.GROUPS, groups)
    return { data: { message: 'Deleted' } }
  }
}

export const mockLabelApi = {
  list: async () => {
    await delay(100)
    return { data: { data: getStored(STORAGE_KEYS.LABELS, INITIAL_LABELS) } }
  },
  create: async (data: any) => {
    await delay()
    const labels = getStored<Label[]>(STORAGE_KEYS.LABELS, INITIAL_LABELS)
    const newLabel = { ...data, id: Date.now() }
    labels.push(newLabel)
    setStored(STORAGE_KEYS.LABELS, labels)
    return { data: { data: newLabel } }
  },
  update: async (id: number, data: any) => {
    await delay()
    const labels = getStored<Label[]>(STORAGE_KEYS.LABELS, INITIAL_LABELS)
    const idx = labels.findIndex(l => l.id === Number(id))
    if (idx !== -1) {
      labels[idx] = { ...labels[idx], ...data }
      setStored(STORAGE_KEYS.LABELS, labels)
    }
    return { data: { data: labels[idx] } }
  },
  remove: async (id: number) => {
    await delay()
    const labels = getStored<Label[]>(STORAGE_KEYS.LABELS, INITIAL_LABELS).filter(l => l.id !== Number(id))
    setStored(STORAGE_KEYS.LABELS, labels)
    return { data: { message: 'Deleted' } }
  }
}

export const mockMilestoneApi = {
  list: async () => {
    await delay(100)
    return { data: { data: getStored(STORAGE_KEYS.MILESTONES, []) } }
  },
  create: async (data: any) => {
    await delay()
    const milestones = getStored<Milestone[]>(STORAGE_KEYS.MILESTONES, [])
    const newMilestone = { ...data, id: Date.now(), progress: 0, created_at: new Date().toISOString() }
    milestones.push(newMilestone)
    setStored(STORAGE_KEYS.MILESTONES, milestones)
    return { data: { data: newMilestone } }
  },
  update: async (id: number, data: any) => {
    await delay()
    const milestones = getStored<Milestone[]>(STORAGE_KEYS.MILESTONES, [])
    const idx = milestones.findIndex(m => m.id === Number(id))
    if (idx !== -1) {
      milestones[idx] = { ...milestones[idx], ...data, updated_at: new Date().toISOString() }
      setStored(STORAGE_KEYS.MILESTONES, milestones)
    }
    return { data: { data: milestones[idx] } }
  },
  remove: async (id: number) => {
    await delay()
    const milestones = getStored<Milestone[]>(STORAGE_KEYS.MILESTONES, []).filter(m => m.id !== Number(id))
    setStored(STORAGE_KEYS.MILESTONES, milestones)
    return { data: { message: 'Deleted' } }
  },
  progress: async (id: number, v: number) => {
    await delay()
    const milestones = getStored<Milestone[]>(STORAGE_KEYS.MILESTONES, [])
    const idx = milestones.findIndex(m => m.id === Number(id))
    if (idx !== -1) {
      milestones[idx].progress = v
      setStored(STORAGE_KEYS.MILESTONES, milestones)
    }
    return { data: { data: milestones[idx] } }
  }
}

export const mockNoteApi = {
  list: async (params: any) => {
    await delay(200)
    let notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    if (params?.archived) notes = notes.filter(n => n.is_archived)
    else notes = notes.filter(n => !n.is_archived && !n.is_deleted)
    return { data: { data: notes } }
  },
  get: async (id: string) => {
    await delay(100)
    const note = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, []).find(n => n.id === id)
    return { data: { data: note } }
  },
  create: async (data: any) => {
    await delay()
    const notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    const newNote: EncryptedNote = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_archived: false,
      is_deleted: false,
      is_pinned: false
    }
    notes.push(newNote)
    setStored(STORAGE_KEYS.NOTES, notes)
    return { data: { data: newNote } }
  },
  update: async (id: string, data: any) => {
    await delay()
    const notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    const idx = notes.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...data, updated_at: new Date().toISOString() }
      setStored(STORAGE_KEYS.NOTES, notes)
    }
    return { data: { data: notes[idx] } }
  },
  remove: async (id: string) => {
    await delay()
    const notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    const idx = notes.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes[idx].is_deleted = true
      setStored(STORAGE_KEYS.NOTES, notes)
    }
    return { data: { message: 'Deleted' } }
  },
  restore: async (id: string) => {
    await delay()
    const notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    const idx = notes.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes[idx].is_deleted = false
      setStored(STORAGE_KEYS.NOTES, notes)
    }
    return { data: { data: notes[idx] } }
  },
  archive: async (id: string) => {
    await delay()
    const notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    const idx = notes.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes[idx].is_archived = !notes[idx].is_archived
      setStored(STORAGE_KEYS.NOTES, notes)
    }
    return { data: { data: notes[idx] } }
  },
  pin: async (id: string) => {
    await delay()
    const notes = getStored<EncryptedNote[]>(STORAGE_KEYS.NOTES, [])
    const idx = notes.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes[idx].is_pinned = !notes[idx].is_pinned
      setStored(STORAGE_KEYS.NOTES, notes)
    }
    return { data: { data: notes[idx] } }
  }
}

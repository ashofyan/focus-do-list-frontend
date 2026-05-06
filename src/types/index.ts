export interface User {
  id?: number
  name?: string
  email?: string
  timezone?: string
  [key: string]: unknown
}

export interface MilestoneProgress {
  total: number
  completed: number
  pending: number
  progress: number
}

export interface Milestone {
  id: number
  title: string
  category?: string
  due_date: string
  progress: number
  notes?: string
  task_progress?: MilestoneProgress
  todos?: Todo[]
  created_at?: string
  updated_at?: string
}

export interface Group {
  id: number
  name: string
  color?: string
}

export interface Label {
  id: number
  name: string
}

export interface Todo {
  id: number
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  is_pinned: boolean
  group_id?: number
  milestone_id?: number
  group?: Group
  milestone?: Milestone
  labels?: Label[]
  sub_tasks?: any[]
  reminder?: any
  created_at?: string
  updated_at?: string
}

export interface EncryptedNote {
  id: string
  user_id: number
  encrypted_title: string | null
  encrypted_content: string
  note_iv: string
  note_tag: string[] | null
  encryption_version: number
  is_archived: boolean
  is_deleted: boolean
  is_pinned: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
  // UI helper for decrypted content
  decrypted_title?: string
  decrypted_content?: string
  decrypt_error?: boolean
}

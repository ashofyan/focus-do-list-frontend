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

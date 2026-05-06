import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter } from 'lucide-react'
import { todoApi } from '../services/api'
import TodoItem from '../components/todo/TodoItem'
import TodoModal from '../components/todo/TodoModal'

export default function TasksPage() {
  const [modal, setModal]   = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPri]  = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['todos-all', search, status, priority],
    queryFn:  () => todoApi.list({
      search:   search || undefined,
      status:   status || undefined,
      priority: priority || undefined,
    }).then(r => r.data),
  })

  const todos = data?.data ?? []

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">All Tasks</h1>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="filters-row" style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 'var(--s6)', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
            value={priority}
            onChange={e => setPri(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="todo-list">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton" style={{ height: 54, borderRadius: 12 }} />
            ))}
          </div>
        ) : todos.length > 0 ? (
          <div className="todo-list">
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onEdit={id => setModal(id)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Search size={20} /></div>
            <div className="empty-title">Tidak ada task</div>
            <div className="empty-desc">Coba ubah filter atau buat task baru.</div>
          </div>
        )}

        {/* Pagination info */}
        {data?.meta && (
          <div style={{ textAlign: 'center', marginTop: 'var(--s6)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
            {data.meta.total} tasks total
          </div>
        )}
      </div>

      {modal && (
        <TodoModal mode={modal} onClose={() => setModal(null)} />
      )}
    </>
  )
}

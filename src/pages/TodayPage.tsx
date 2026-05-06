import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Plus, ChevronDown, Star, Pin } from 'lucide-react'
import { todoApi } from '../services/api'
import TodoItem from '../components/todo/TodoItem'
import TodoModal from '../components/todo/TodoModal'
import { useToastStore } from '../stores'

const DAYS_SHOWN = 7

function CalendarStrip({ selected, onChange }) {
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) =>
    addDays(startOfDay(new Date()), i - 3)
  )

  return (
    <div className="calendar-strip">
      {days.map(day => {
        const isActive = isSameDay(day, selected)
        return (
          <button
            key={day.toISOString()}
            className={`cal-day ${isActive ? 'active' : ''}`}
            onClick={() => onChange(day)}
          >
            <span className="cal-day-name">{format(day, 'EEE')}</span>
            <span className="cal-day-num">{format(day, 'd')}</span>
            <span className="cal-dot" />
          </button>
        )
      })}
    </div>
  )
}

export default function TodayPage() {
  const qc    = useQueryClient()
  const toast = useToastStore()

  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const [todoModal, setTodoModal]       = useState(null)  // null | 'create' | id

  const dateParam = format(selectedDate, 'yyyy-MM-dd')

  const { data: todosData, isLoading } = useQuery({
    queryKey: ['todos', dateParam],
    queryFn:  () => todoApi.list({ date: dateParam }).then(r => r.data),
  })

  const { data: pinnedData } = useQuery({
    queryKey: ['todos-pinned'],
    queryFn:  () => todoApi.pinned().then(r => r.data.data),
  })

  const todos  = todosData?.data ?? []
  const pinned = pinnedData ?? []

  const pending   = todos.filter(t => t.status !== 'completed')
  const completed = todos.filter(t => t.status === 'completed')

  const isToday  = isSameDay(selectedDate, new Date())
  const pageTitle = isToday
    ? 'Today'
    : format(selectedDate, 'EEEE, d MMM', { locale: idLocale })

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <h1 className="topbar-title">{pageTitle}</h1>
        <span className="topbar-date">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
        </span>
        <button className="btn btn-primary" onClick={() => setTodoModal('create')}>
          <Plus size={14} />
          Add Task
        </button>
      </div>

      <div className="page-body">
        {/* Calendar strip */}
        <CalendarStrip selected={selectedDate} onChange={setSelectedDate} />

        <div className="two-col">
          {/* LEFT: Todo list */}
          <div>
            {/* Pending tasks */}
            <div className="section-header">
              <h2 className="section-title">
                Tasks
                {pending.length > 0 && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                    {pending.length}
                  </span>
                )}
              </h2>
            </div>

            {isLoading ? (
              <div className="todo-list">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton" style={{ height: 54, borderRadius: 12 }} />
                ))}
              </div>
            ) : pending.length > 0 ? (
              <div className="todo-list">
                {pending.map(todo => (
                  <TodoItem key={todo.id} todo={todo} onEdit={id => setTodoModal(id)} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Star size={20} />
                </div>
                <div className="empty-title">All clear!</div>
                <div className="empty-desc">
                  Tidak ada task untuk hari ini.{' '}
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', color: 'var(--text-muted)' }}
                    onClick={() => setTodoModal('create')}
                  >
                    Tambah task baru?
                  </button>
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <>
                <div className="section-header" style={{ marginTop: 'var(--s4)' }}>
                  <h2 className="section-title" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    Completed · {completed.length}
                  </h2>
                </div>
                <div className="todo-list">
                  {completed.map(todo => (
                    <TodoItem key={todo.id} todo={todo} onEdit={id => setTodoModal(id)} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Pinned panel */}
          <div>
            <div className="section-header">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Pinned
                <Star size={16} fill="currentColor" style={{ color: 'var(--gray-400)' }} />
              </h2>
            </div>

            {pinned.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                {pinned.map(todo => (
                  <div key={todo.id} className="pinned-card">
                    <div className="pinned-card-title">
                      <span>{todo.title}</span>
                    </div>

                    {/* Sub-tasks */}
                    {todo.sub_tasks?.length > 0 && (
                      <div>
                        {todo.sub_tasks.map(st => (
                          <div key={st.id} className="subtask-row">
                            <div className={`todo-check ${st.is_completed ? 'checked' : ''}`} style={{ width: 15, height: 15 }}>
                              {st.is_completed && (
                                <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              )}
                            </div>
                            <span className={`subtask-title ${st.is_completed ? 'done' : ''}`}>{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Group label */}
                    {todo.group && (
                      <div style={{ marginTop: 'var(--s2)' }}>
                        <span className="todo-label-chip">{todo.group.name}</span>
                      </div>
                    )}

                    {/* Notes area */}
                    <div className="notes-area" style={{ marginTop: 'var(--s3)' }}>
                      <textarea placeholder="Notes..." rows={3} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pinned-card">
                <div style={{ textAlign: 'center', padding: 'var(--s6)', color: 'var(--text-faint)' }}>
                  <Pin size={20} style={{ margin: '0 auto var(--s2)' }} />
                  <div style={{ fontSize: 12 }}>Pin task untuk akses cepat</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {todoModal && (
        <TodoModal
          mode={todoModal}
          onClose={() => setTodoModal(null)}
        />
      )}
    </>
  )
}

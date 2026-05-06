import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, addMonths, subMonths, isToday
} from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { todoApi } from '../services/api'
import TodoModal from '../components/todo/TodoModal'

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function buildCalendarDays(month) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end   = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const days  = []
  let cur     = start
  while (cur <= end) { days.push(cur); cur = addDays(cur, 1) }
  return days
}

export default function CalendarPage() {
  const [month, setMonth]   = useState(new Date())
  const [todoModal, setTodoModal] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(month),   'yyyy-MM-dd')

  const { data } = useQuery({
    queryKey: ['todos-calendar', monthStart],
    queryFn:  () => todoApi.list({ per_page: 200 }).then(r => r.data.data ?? []),
  })

  const todos = data ?? []

  // Group todos by date string
  const byDay = todos.reduce((acc, t) => {
    if (!t.due_date) return acc
    const key = t.due_date.slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const days = buildCalendarDays(month)

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Calendar</h1>
        <button className="btn btn-primary" onClick={() => setTodoModal('create')}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      <div className="page-body">
        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s6)' }}>
          <button className="btn-icon" onClick={() => setMonth(m => subMonths(m, 1))}>
            <ChevronLeft size={16} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
            {format(month, 'MMMM yyyy', { locale: idLocale })}
          </h2>
          <button className="btn-icon" onClick={() => setMonth(m => addMonths(m, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="calendar-dow" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DOW.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
              letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-faint)',
              padding: '4px 0'
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map(day => {
            const key       = format(day, 'yyyy-MM-dd')
            const dayTodos  = byDay[key] ?? []
            const inMonth   = isSameMonth(day, month)
            const selected  = selectedDay && isSameDay(day, selectedDay)
            const today     = isToday(day)
            const pending   = dayTodos.filter(t => t.status !== 'completed')
            const completed = dayTodos.filter(t => t.status === 'completed')

            return (
              <div
                key={key}
                onClick={() => setSelectedDay(selected ? null : day)}
                style={{
                  minHeight: 80,
                  border: `1px solid ${selected ? 'var(--black)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-lg)',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  background: selected ? 'var(--black)' : today ? 'var(--bg-subtle)' : 'var(--bg)',
                  opacity: inMonth ? 1 : .35,
                  transition: 'all var(--dur-fast)',
                  position: 'relative',
                }}
              >
                {/* Day number */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  color: selected ? 'var(--white)' : today ? 'var(--black)' : 'var(--text)',
                  lineHeight: 1,
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  {format(day, 'd')}
                  {today && !selected && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--black)', display: 'block'
                    }} />
                  )}
                </div>

                {/* Todo dots/pills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {pending.slice(0, 2).map(t => (
                    <div key={t.id} style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)',
                      color: selected ? 'rgba(255,255,255,.7)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      background: selected ? 'rgba(255,255,255,.1)' : 'var(--bg-inset)',
                      padding: '1px 4px', borderRadius: 3,
                    }}>
                      {t.title}
                    </div>
                  ))}
                  {pending.length > 2 && (
                    <div style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)',
                      color: selected ? 'rgba(255,255,255,.5)' : 'var(--text-faint)',
                    }}>+{pending.length - 2} more</div>
                  )}
                  {completed.length > 0 && (
                    <div style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)',
                      color: selected ? 'rgba(255,255,255,.4)' : 'var(--text-faint)',
                    }}>✓ {completed.length} done</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected day detail */}
        {selectedDay && (() => {
          const key = format(selectedDay, 'yyyy-MM-dd')
          const dayTodos = byDay[key] ?? []
          return (
            <div style={{
              marginTop: 'var(--s6)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: 'var(--s5)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 'var(--s4)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
                  {format(selectedDay, 'EEEE, d MMMM', { locale: idLocale })}
                </h3>
                <button
                  className="btn btn-ghost"
                  onClick={() => setTodoModal('create')}
                  style={{ fontSize: 11 }}
                >
                  <Plus size={12} /> Task
                </button>
              </div>
              {dayTodos.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', padding: 'var(--s4)' }}>
                  Tidak ada task
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                  {dayTodos.map(t => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--s3)',
                      padding: '8px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      opacity: t.status === 'completed' ? .5 : 1,
                    }}>
                      <div className={`todo-priority-bar priority-${t.priority}`}
                        style={{ position: 'static', width: 2, height: 16, flexShrink: 0, borderRadius: 4 }} />
                      <span style={{
                        flex: 1, fontSize: 12,
                        textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                        color: 'var(--text)'
                      }}>{t.title}</span>
                      {t.due_date && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>
                          {format(new Date(t.due_date), 'HH:mm')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {todoModal && <TodoModal mode={todoModal} onClose={() => setTodoModal(null)} />}
    </>
  )
}

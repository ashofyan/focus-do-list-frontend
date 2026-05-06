import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, startOfDay, isSameDay, isThisWeek, isThisMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CheckCircle, Clock, TrendingUp, Target, Zap, type LucideIcon } from 'lucide-react'
import { todoApi, milestoneApi } from '../services/api'

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

function StatCard({ icon: Icon, label, value, sub, accent = false }: StatCardProps) {
  return (
    <div style={{
      border: `1px solid ${accent ? 'var(--black)' : 'var(--border)'}`,
      borderRadius: 'var(--r-xl)',
      padding: 'var(--s5)',
      background: accent ? 'var(--black)' : 'var(--bg)',
      display: 'flex', flexDirection: 'column', gap: 'var(--s2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
        <Icon size={14} style={{ color: accent ? 'var(--gray-400)' : 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)', color: accent ? 'var(--gray-400)' : 'var(--text-muted)'
        }}>{label}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1,
        color: accent ? 'var(--white)' : 'var(--text)'
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: accent ? 'var(--gray-500)' : 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function MiniBar({ label, value, max, count }: { label: string; value: number; max: number; count: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
      <span style={{
        width: 28, fontSize: 10, fontFamily: 'var(--font-mono)',
        color: 'var(--text-faint)', textAlign: 'right', flexShrink: 0
      }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg-inset)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: 'var(--black)',
          borderRadius: 'var(--r-full)', transition: 'width .6s var(--ease-out)'
        }} />
      </div>
      <span style={{ width: 20, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>
        {count}
      </span>
    </div>
  )
}

function ActivityHeatmap({ todos }: { todos: any[] }) {
  const days = Array.from({ length: 35 }, (_, i) => subDays(new Date(), 34 - i))

  const completedByDay = todos
    .filter(t => t.status === 'completed' && t.completed_at)
    .reduce<Record<string, number>>((acc, t) => {
      const k = t.completed_at.slice(0, 10)
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})

  const max = Math.max(1, ...Object.values(completedByDay))

  return (
    <div>
      <div style={{ marginBottom: 'var(--s3)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Activity — last 5 weeks
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {days.map(day => {
          const k = format(day, 'yyyy-MM-dd')
          const count = completedByDay[k] || 0
          const intensity = count === 0 ? 0 : Math.ceil((count / max) * 4)
          const alphas = [0, .15, .35, .6, 1]
          return (
            <div
              key={k}
              title={`${format(day, 'd MMM')}: ${count} completed`}
              style={{
                height: 14,
                borderRadius: 3,
                background: `rgba(10,10,10,${alphas[intensity]})`,
                border: '1px solid var(--border)',
                cursor: 'default',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const { data: allTodos = [] } = useQuery({
    queryKey: ['todos-stats'],
    queryFn:  () => todoApi.list({ per_page: 500 }).then(r => r.data.data ?? []),
  })

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn:  () => milestoneApi.list().then(r => r.data.data ?? []),
  })

  const stats = useMemo(() => {
    const completed  = allTodos.filter(t => t.status === 'completed')
    const pending    = allTodos.filter(t => t.status !== 'completed')
    const thisWeek   = completed.filter(t => t.completed_at && isThisWeek(new Date(t.completed_at)))
    const thisMonth  = completed.filter(t => t.completed_at && isThisMonth(new Date(t.completed_at)))
    const rate       = allTodos.length > 0 ? Math.round((completed.length / allTodos.length) * 100) : 0
    const avgMilestone = milestones.length > 0
      ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
      : 0

    const byPriority = {
      high:   allTodos.filter(t => t.priority === 'high').length,
      medium: allTodos.filter(t => t.priority === 'medium').length,
      low:    allTodos.filter(t => t.priority === 'low').length,
    }

    // Completions per day (last 7)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i)
      const count = completed.filter(t =>
        t.completed_at && isSameDay(new Date(t.completed_at), day)
      ).length
      return { day, count, label: format(day, 'EEE', { locale: idLocale }) }
    })

    const maxDay = Math.max(1, ...last7.map(d => d.count))

    return { completed, pending, thisWeek, thisMonth, rate, avgMilestone, byPriority, last7, maxDay }
  }, [allTodos, milestones])

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Stats</h1>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {format(new Date(), 'MMMM yyyy', { locale: idLocale })}
        </span>
      </div>

      <div className="page-body">

        {/* Stat cards grid */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)', marginBottom: 'var(--s8)' }}>
          <StatCard icon={CheckCircle} label="Total Done"    value={stats.completed.length} sub="all time"        accent />
          <StatCard icon={Zap}         label="This Week"     value={stats.thisWeek.length}  sub="completed tasks" />
          <StatCard icon={TrendingUp}  label="Completion %"  value={`${stats.rate}%`}       sub={`${allTodos.length} total tasks`} />
          <StatCard icon={Target}      label="Avg Milestone" value={`${stats.avgMilestone}%`} sub={`${milestones.length} milestones`} />
        </div>

        <div className="two-col" style={{ gap: 'var(--s6)' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

            {/* Activity heatmap */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--s5)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 'var(--s4)' }}>
                Completion Activity
              </h3>
              <ActivityHeatmap todos={allTodos} />
            </div>

            {/* Daily completions — last 7 days */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--s5)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 'var(--s5)' }}>
                Last 7 Days
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                {stats.last7.map(({ label, count }) => (
                  <MiniBar key={label} label={label} value={count} max={stats.maxDay} count={count} />
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

            {/* Priority breakdown */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--s5)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 'var(--s5)' }}>
                By Priority
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                {[
                  { label: 'High',   key: 'high',   bar: '●' },
                  { label: 'Medium', key: 'medium', bar: '●' },
                  { label: 'Low',    key: 'low',    bar: '●' },
                ].map(({ label, key }) => {
                  const count = stats.byPriority[key]
                  const total = allTodos.length || 1
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
                          {count} / {total}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.round((count / total) * 100)}%`,
                          height: '100%', background: 'var(--black)',
                          borderRadius: 'var(--r-full)',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Milestone progress */}
            {milestones.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--s5)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 'var(--s4)' }}>
                  Milestones
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                  {milestones.slice(0, 5).map(m => (
                    <div key={m.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{m.title}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
                          {m.progress}%
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-inset)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${m.progress}%`, height: '100%', background: 'var(--black)',
                          borderRadius: 'var(--r-full)', transition: 'width .6s',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick numbers */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 'var(--s5)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 'var(--s4)' }}>
                Overview
              </h3>
              {[
                { label: 'Pending tasks',   value: stats.pending.length },
                { label: 'Done this month', value: stats.thisMonth.length },
                { label: 'Total tasks',     value: allTodos.length },
                { label: 'Milestones',      value: milestones.length },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--bg-inset)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

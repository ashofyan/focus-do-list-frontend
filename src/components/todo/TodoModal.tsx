import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { todoApi, groupApi, labelApi, milestoneApi } from '../../services/api'
import { useToastStore } from '../../stores'

const PRIORITIES = [
  { value: 'high',   label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low' },
]

export default function TodoModal({ mode, onClose }) {
  const qc     = useQueryClient()
  const toast  = useToastStore()
  const editId =
    typeof mode === 'number'
      ? mode
      : mode && typeof mode === 'object' && typeof mode.id === 'number'
        ? mode.id
        : null
  const isEdit = editId !== null

  const [form, setForm] = useState({
    title: '', description: '', due_date: '', priority: 'medium',
    group_id: '', milestone_id: '', label_ids: [],
    reminder: { is_enabled: false, offset_minutes: 15 },
  })

  // Load existing todo when editing
  const { data: existing } = useQuery({
    queryKey: ['todo', editId],
    queryFn:  () => todoApi.get(editId).then(r => r.data.data),
    enabled:  isEdit,
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn:  () => groupApi.list().then(r => r.data.data),
  })

  const { data: labels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn:  () => labelApi.list().then(r => r.data.data),
  })

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn:  () => milestoneApi.list().then(r => r.data.data),
  })

  useEffect(() => {
    if (existing) {
      setForm({
        title:       existing.title || '',
        description: existing.description || '',
        due_date:    existing.due_date ? existing.due_date.slice(0, 16) : '',
        priority:    existing.priority || 'medium',
        group_id:    existing.group_id || '',
        milestone_id: existing.milestone_id || '',
        label_ids:   existing.labels?.map(l => l.id) || [],
        reminder: existing.reminder
          ? { is_enabled: existing.reminder.is_enabled, offset_minutes: existing.reminder.offset_minutes }
          : { is_enabled: false, offset_minutes: 15 },
      })
    }
  }, [existing])

  const saveMutation = useMutation({
    mutationFn: (data: any) => isEdit ? todoApi.update(editId, data) : todoApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      qc.invalidateQueries({ queryKey: ['milestones'] })
      toast.success(isEdit ? 'Todo diperbarui.' : 'Todo dibuat!')
      onClose()
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Terjadi kesalahan.'),
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setReminder = (key, val) => setForm(f => ({ ...f, reminder: { ...f.reminder, [key]: val } }))

  const toggleLabel = id => {
    set('label_ids', form.label_ids.includes(id)
      ? form.label_ids.filter(x => x !== id)
      : [...form.label_ids, id]
    )
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      ...form,
      group_id: form.group_id || null,
      milestone_id: form.milestone_id || null,
    }
    if (!form.due_date) delete payload.reminder
    saveMutation.mutate(payload)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Todo' : 'New Todo'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Add notes..."
                rows={2}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Due date + Priority */}
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.due_date}
                  onChange={e => set('due_date', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Group & Milestone */}
            <div className="form-row" style={{ marginTop: 'var(--s4)' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Group</label>
                <select className="form-input" value={form.group_id} onChange={e => set('group_id', e.target.value)}>
                  <option value="">— No Group —</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Milestone</label>
                <select className="form-input" value={form.milestone_id} onChange={e => set('milestone_id', e.target.value)}>
                  <option value="">— No Milestone —</option>
                  {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div className="form-group" style={{ marginTop: 'var(--s4)' }}>
                <label className="form-label">Labels</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {labels.map(l => (
                    <button
                      key={l.id} type="button"
                      onClick={() => toggleLabel(l.id)}
                      className="pill"
                      style={{
                        background: form.label_ids.includes(l.id) ? 'var(--black)' : 'var(--bg-inset)',
                        color:      form.label_ids.includes(l.id) ? 'var(--white)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reminder */}
            {form.due_date && (
              <>
                <div className="divider" />
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div className="toggle-wrap">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={form.reminder.is_enabled}
                        onChange={e => setReminder('is_enabled', e.target.checked)}
                      />
                      <div className="toggle-track" />
                      <div className="toggle-thumb" />
                    </label>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Reminder</span>
                  </div>

                  {form.reminder.is_enabled && (
                    <div style={{ marginTop: '12px' }}>
                      <div>
                        <label className="form-label">Remind Before (minutes)</label>
                        <input
                          type="number"
                          className="form-input"
                          min={0} max={10080}
                          value={form.reminder.offset_minutes}
                          onChange={e => setReminder('offset_minutes', +e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Trash2, Tag, Layers, Edit2 } from 'lucide-react'
import { groupApi, labelApi } from '../services/api'
import { useToastStore } from '../stores'

const PRESET_COLORS = [
  '#0a0a0a','#3a3a3a','#777777','#bbbbbb',
  '#2563eb','#7c3aed','#db2777','#dc2626',
  '#d97706','#16a34a','#0891b2','#6b7280',
]

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {PRESET_COLORS.map(c => (
        <button
          key={c} type="button"
          onClick={() => onChange(c)}
          style={{
            width: 22, height: 22, borderRadius: '50%', background: c,
            border: value === c ? '3px solid var(--black)' : '2px solid transparent',
            outline: value === c ? '2px solid var(--white)' : 'none',
            outlineOffset: -1,
            cursor: 'pointer', transition: 'transform .1s',
            transform: value === c ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

function GroupModal({ group, onClose }) {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const isEdit = !!group

  const [form, setForm] = useState({ name: group?.name || '', color: group?.color || '#0a0a0a' })

  const save = useMutation({
    mutationFn: (d: any) => isEdit ? groupApi.update(group.id, d) : groupApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); toast.success(isEdit ? 'Group diperbarui.' : 'Group dibuat!'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Gagal.'),
  })

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Group' : 'New Group'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); save.mutate(form) }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} autoFocus
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Group name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Color</label>
              <ColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={save.isPending || !form.name}>
              {save.isPending ? 'Saving...' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LabelModal({ label, onClose }) {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const isEdit = !!label

  const [form, setForm] = useState({ name: label?.name || '', color: label?.color || '#0a0a0a' })

  const save = useMutation({
    mutationFn: (d: any) => isEdit ? labelApi.update(label.id, d) : labelApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['labels'] }); toast.success(isEdit ? 'Label diperbarui.' : 'Label dibuat!'); onClose() },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Gagal.'),
  })

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Label' : 'New Label'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); save.mutate(form) }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} autoFocus
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Label name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Color</label>
              <ColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={save.isPending || !form.name}>
              {save.isPending ? 'Saving...' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function GroupsPage() {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const [groupModal, setGroupModal] = useState(null)
  const [labelModal, setLabelModal] = useState(null)

  const { data: groups = [], isLoading: gLoading } = useQuery({
    queryKey: ['groups'],
    queryFn:  () => groupApi.list().then(r => r.data.data),
  })

  const { data: labels = [], isLoading: lLoading } = useQuery({
    queryKey: ['labels'],
    queryFn:  () => labelApi.list().then(r => r.data.data),
  })

  const deleteGroup = useMutation({
    mutationFn: id => groupApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); toast.success('Group dihapus.') },
  })

  const deleteLabel = useMutation({
    mutationFn: id => labelApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['labels'] }); toast.success('Label dihapus.') },
  })

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Groups & Labels</h1>
      </div>

      <div className="page-body">
        <div className="two-col" style={{ gap: 'var(--s8)' }}>

          {/* GROUPS */}
          <section>
            <div className="section-header">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} style={{ color: 'var(--text-muted)' }} />
                Groups
              </h2>
              <button className="btn btn-ghost" onClick={() => setGroupModal('create')}>
                <Plus size={13} /> New
              </button>
            </div>

            {gLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />)}
              </div>
            ) : groups.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--s8)' }}>
                <div className="empty-icon"><Layers size={18} /></div>
                <div className="empty-title">No groups yet</div>
                <div className="empty-desc">Kelompokkan todo-mu dengan groups.</div>
                <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setGroupModal('create')}>
                  <Plus size={12} /> Create Group
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                {groups.map(g => (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--s3)',
                    padding: '12px var(--s4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--bg)',
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                    {g.todos_count !== undefined && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>
                        {g.todos_count} tasks
                      </span>
                    )}
                    <button className="btn-icon" onClick={() => setGroupModal(g)} title="Edit">
                      <Edit2 size={12} />
                    </button>
                    <button className="btn-icon" title="Hapus"
                      onClick={() => { if (confirm('Hapus group? Todo akan tetap ada.')) deleteGroup.mutate(g.id) }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LABELS */}
          <section>
            <div className="section-header">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} style={{ color: 'var(--text-muted)' }} />
                Labels
              </h2>
              <button className="btn btn-ghost" onClick={() => setLabelModal('create')}>
                <Plus size={13} /> New
              </button>
            </div>

            {lLoading ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 32, width: 80, borderRadius: 99 }} />)}
              </div>
            ) : labels.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--s8)' }}>
                <div className="empty-icon"><Tag size={18} /></div>
                <div className="empty-title">No labels yet</div>
                <div className="empty-desc">Beri label warna pada todo-mu.</div>
                <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setLabelModal('create')}>
                  <Plus size={12} /> Create Label
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                {labels.map(l => (
                  <div key={l.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--s3)',
                    padding: '12px var(--s4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--bg)',
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{l.name}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                      letterSpacing: '.06em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: l.color + '22', color: l.color,
                      border: `1px solid ${l.color}44`,
                    }}>{l.name}</span>
                    <button className="btn-icon" onClick={() => setLabelModal(l)} title="Edit">
                      <Edit2 size={12} />
                    </button>
                    <button className="btn-icon" title="Hapus"
                      onClick={() => { if (confirm('Hapus label ini?')) deleteLabel.mutate(l.id) }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {groupModal && <GroupModal group={groupModal === 'create' ? null : groupModal} onClose={() => setGroupModal(null)} />}
      {labelModal && <LabelModal label={labelModal === 'create' ? null : labelModal} onClose={() => setLabelModal(null)} />}
    </>
  )
}

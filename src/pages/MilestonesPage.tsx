import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Plus, X, Trash2, CheckCircle2, Circle } from "lucide-react"
import { milestoneApi, todoApi } from "../services/api"
import { useToastStore } from "../stores"

function MilestoneModal({ milestone, onClose }) {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const isEdit = !!milestone

  const [form, setForm] = useState({
    title:    milestone?.title    || "",
    category: milestone?.category || "",
    due_date: milestone?.due_date || "",
    notes:    milestone?.notes    || "",
    task_ids: milestone?.todos?.map(t => t.id) || [],
  })

  const { data: allTodos = [] } = useQuery({
    queryKey: ["todos-minimal"],
    queryFn:  () => todoApi.list({ per_page: 100 }).then(r => r.data.data),
  })

  const save = useMutation({
    mutationFn: (data: any) => isEdit ? milestoneApi.update(milestone.id, data) : milestoneApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestones"] })
      qc.invalidateQueries({ queryKey: ["todos"] })
      toast.success(isEdit ? "Milestone diperbarui." : "Milestone dibuat!")
      onClose()
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Gagal."),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleTask = id => {
    const ids = form.task_ids.includes(id)
      ? form.task_ids.filter(x => x !== id)
      : [...form.task_ids, id]
    set("task_ids", ids)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Milestone" : "New Milestone"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); save.mutate(form) }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Milestone name" autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <input className="form-input" value={form.category} onChange={e => set("category", e.target.value)} placeholder="Work, Personal..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Due Date *</label>
                <input type="date" className="form-input" value={form.due_date} onChange={e => set("due_date", e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "var(--s4)" }}>
              <label className="form-label">Connect Tasks</label>
              <div style={{
                maxHeight: 150,
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: "8px"
              }}>
                {allTodos.length === 0 && <div style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", padding: "12px" }}>No tasks available</div>}
                {allTodos.map(t => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 8px",
                      cursor: "pointer",
                      borderRadius: 6,
                      background: form.task_ids.includes(t.id) ? "var(--bg-inset)" : "transparent",
                      fontSize: 13,
                      marginBottom: 2
                    }}
                  >
                    {form.task_ids.includes(t.id) ? <CheckCircle2 size={14} color="var(--primary)" /> : <Circle size={14} color="var(--text-faint)" />}
                    <span style={{ textDecoration: t.status === "completed" ? "line-through" : "none", color: t.status === "completed" ? "var(--text-faint)" : "inherit" }}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." style={{ resize: "vertical" }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={save.isPending || !form.title || !form.due_date}>
              {save.isPending ? "Saving..." : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MilestonesPage() {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const [modal, setModal] = useState(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["milestones"],
    queryFn:  () => milestoneApi.list().then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: id => milestoneApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["milestones"] }); toast.success("Dihapus.") },
  })

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Milestones</h1>
        <button className="btn btn-primary" onClick={() => setModal("create")}>
          <Plus size={14} /> New Milestone
        </button>
      </div>

      <div className="page-body">
        {isLoading ? (
          <div className="milestone-list">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />)}
          </div>
        ) : milestones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Plus size={20} /></div>
            <div className="empty-title">No milestones yet</div>
            <div className="empty-desc">Track jangka panjang projekmu dengan milestone.</div>
            <button className="btn btn-primary" style={{ marginTop: "var(--s2)" }} onClick={() => setModal("create")}>
              Create Milestone
            </button>
          </div>
        ) : (
          <div className="milestone-list">
            {milestones.map(m => {
              const d = new Date(m.due_date)
              const progress = m.task_progress?.progress ?? m.progress
              const isExpanded = expanded === m.id

              return (
                <div key={m.id} className="milestone-container" style={{ marginBottom: "var(--s4)" }}>
                  <div className="milestone-card" onClick={() => setExpanded(isExpanded ? null : m.id)} style={{ cursor: "pointer" }}>
                    <div className="milestone-info">
                      <div className="milestone-title">{m.title}</div>
                      {m.category && <div className="milestone-cat">{m.category}</div>}
                    </div>

                    <div className="milestone-progress-wrap">
                      <div className="milestone-progress-bar">
                        <div className="milestone-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="milestone-pct">{Math.round(progress)}%</span>
                    </div>

                    {m.task_progress && (
                      <div style={{ fontSize: 11, color: "var(--text-faint)", marginRight: "var(--s4)", whiteSpace: "nowrap" }}>
                        {m.task_progress.completed}/{m.task_progress.total} Tasks
                      </div>
                    )}

                    <div className="milestone-date-badge">
                      <span className="milestone-date-day">{format(d, "d")}</span>
                      <span className="milestone-date-mon">{format(d, "MMM")}</span>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-icon" onClick={e => { e.stopPropagation(); setModal(m) }}>
                        <Plus size={13} style={{ transform: "rotate(45deg)" }} />
                      </button>
                      <button className="btn-icon" onClick={e => { e.stopPropagation(); if (confirm("Hapus milestone?")) deleteMutation.mutate(m.id) }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && m.todos && m.todos.length > 0 && (
                    <div className="milestone-details" style={{
                      padding: "var(--s4)",
                      background: "var(--bg-inset)",
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      marginTop: -8,
                      border: "1px solid var(--border-color)",
                      borderTop: "none"
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-muted)" }}>CONNECTED TASKS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {m.todos.map(t => (
                          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                            {t.status === "completed" ? <CheckCircle2 size={12} color="var(--success)" /> : <Circle size={12} color="var(--text-faint)" />}
                            <span style={{ textDecoration: t.status === "completed" ? "line-through" : "none", color: t.status === "completed" ? "var(--text-faint)" : "inherit" }}>
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <MilestoneModal
          milestone={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

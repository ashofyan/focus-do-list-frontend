import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import {
  ArrowLeft, CheckCircle, Circle, Pin, Trash2,
  Plus, Bell, BellOff, Clock, Flag, Layers, Tag, Edit2, Check, X
} from "lucide-react"
import { todoApi, reminderApi } from "../services/api"
import { useToastStore } from "../stores"
import TodoModal from "../components/todo/TodoModal"

function SubTaskInline({ subTask, todoId }) {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(subTask.title)

  const toggle = useMutation({
    mutationFn: () => todoApi.toggleSubTask(todoId, subTask.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todo-detail", todoId] })
      qc.invalidateQueries({ queryKey: ["milestones"] })
    },
  })

  const update = useMutation({
    mutationFn: () => todoApi.update(todoId, {}).then(() =>
      fetch(`/api/todos/${todoId}/sub-tasks/${subTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ title })
      })
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["todo-detail", todoId] }); setEditing(false) },
  })

  const remove = useMutation({
    mutationFn: () => todoApi.removeSubTask(todoId, subTask.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["todo-detail", todoId] }); toast.success("Sub-task dihapus.") },
  })

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--bg-inset)" }}>
      <button
        onClick={() => toggle.mutate()}
        style={{ background: "none", border: "none", cursor: "pointer", color: subTask.is_completed ? "var(--black)" : "var(--gray-300)", display: "flex", flexShrink: 0 }}
      >
        {subTask.is_completed ? <CheckCircle size={16} /> : <Circle size={16} />}
      </button>

      {editing ? (
        <>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") update.mutate(); if (e.key === "Escape") setEditing(false) }}
            autoFocus
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "var(--font-ui)", background: "none", color: "var(--text)" }}
          />
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--black)" }} onClick={() => update.mutate()}>
            <Check size={14} />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }} onClick={() => setEditing(false)}>
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <span style={{ flex: 1, fontSize: 13, textDecoration: subTask.is_completed ? "line-through" : "none", color: subTask.is_completed ? "var(--text-faint)" : "var(--text)" }}>
            {subTask.title}
          </span>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex" }} onClick={() => setEditing(true)}>
            <Edit2 size={12} />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex" }} onClick={() => { if (confirm("Hapus?")) remove.mutate() }}>
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  )
}

function AddSubTask({ todoId }) {
  const qc    = useQueryClient()
  const toast = useToastStore()
  const [title, setTitle] = useState("")

  const add = useMutation({
    mutationFn: () => todoApi.addSubTask(todoId, { title }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["todo-detail", todoId] }); setTitle(""); toast.success("Sub-task ditambahkan.") },
  })

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input
        className="form-input"
        placeholder="Tambah sub-task..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && title.trim()) add.mutate() }}
        style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
      />
      <button className="btn btn-ghost" onClick={() => title.trim() && add.mutate()} disabled={!title.trim() || add.isPending}>
        <Plus size={13} />
      </button>
    </div>
  )
}

const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" }
const STATUS_LABEL   = { pending: "Pending", in_progress: "In Progress", completed: "Completed" }

export default function TodoDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const toast      = useToastStore()
  const [editModal, setEditModal] = useState(false)
  const todoId     = Number(id)
  const hasValidTodoId = Number.isInteger(todoId) && todoId > 0

  const { data: todo, isLoading } = useQuery({
    queryKey: ["todo-detail", todoId],
    queryFn:  () => todoApi.get(todoId).then(r => r.data.data),
    enabled: hasValidTodoId,
  })

  const complete = useMutation({
    mutationFn: () => todoApi.complete(todoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todo-detail", todoId] })
      qc.invalidateQueries({ queryKey: ["milestones"] })
      toast.success("Status diperbarui.")
    },
  })

  const pin = useMutation({
    mutationFn: () => todoApi.pin(todoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todo-detail", todoId] }),
  })

  const remove = useMutation({
    mutationFn: () => todoApi.remove(todoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestones"] })
      toast.success("Todo dihapus.")
      navigate("/tasks")
    },
  })

  const toggleReminder = useMutation({
    mutationFn: () => reminderApi.toggle(todoId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["todo-detail", todoId] }); toast.success("Reminder diperbarui.") },
  })

  if (!hasValidTodoId) return (
    <>
      <div className="topbar">
        <button className="btn-icon" onClick={() => navigate("/tasks")} style={{ marginRight: 4 }}>
          <ArrowLeft size={16} />
        </button>
        <h1 className="topbar-title">Todo tidak valid</h1>
      </div>
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-title">Todo tidak ditemukan</div>
          <button className="btn btn-primary" onClick={() => navigate("/tasks")}>Kembali ke tasks</button>
        </div>
      </div>
    </>
  )

  if (isLoading) return (
    <>
      <div className="topbar"><h1 className="topbar-title">Loading...</h1></div>
      <div className="page-body">
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 12 }} />)}
      </div>
    </>
  )

  if (!todo) return null

  const isCompleted = todo.status === "completed"
  const doneCount   = todo.sub_tasks?.filter(s => s.is_completed).length ?? 0
  const totalCount  = todo.sub_tasks?.length ?? 0
  const progress    = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <>
      <div className="topbar">
        <button className="btn-icon" onClick={() => navigate(-1)} style={{ marginRight: 4 }}>
          <ArrowLeft size={16} />
        </button>
        <h1 className="topbar-title" style={{ fontSize: 16 }}>Todo Detail</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setEditModal(true)}><Edit2 size={13} /> Edit</button>
          <button className="btn btn-ghost" onClick={() => { if (confirm("Hapus todo ini?")) remove.mutate() }} style={{ color: "#c0392b" }}>
            <Trash2 size={13} /> Hapus
          </button>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 680 }}>

        {/* Title + status */}
        <div style={{ marginBottom: "var(--s6)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--s3)", marginBottom: "var(--s3)" }}>
            <button
              onClick={() => complete.mutate()}
              style={{ background: "none", border: "none", cursor: "pointer", color: isCompleted ? "var(--black)" : "var(--gray-400)", marginTop: 2, flexShrink: 0 }}
            >
              {isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
            </button>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400,
              textDecoration: isCompleted ? "line-through" : "none",
              color: isCompleted ? "var(--text-muted)" : "var(--text)", flex: 1,
            }}>
              {todo.title}
            </h1>
            <button className={`todo-pin-btn ${todo.is_pinned ? "pinned" : ""}`} onClick={() => pin.mutate()}>
              <Pin size={16} />
            </button>
          </div>

          {todo.description && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, paddingLeft: 32 }}>
              {todo.description}
            </p>
          )}
        </div>

        {/* Meta grid */}
        <div className="todo-detail-meta-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--s3)",
          marginBottom: "var(--s6)",
        }}>
          {[
            { icon: Clock, label: "Due Date", value: todo.due_date ? format(new Date(todo.due_date), "EEEE, d MMMM yyyy · HH:mm", { locale: idLocale }) : "—" },
            { icon: Flag,  label: "Priority", value: PRIORITY_LABEL[todo.priority] ?? "—" },
            { icon: Layers,label: "Status",   value: STATUS_LABEL[todo.status] ?? "—" },
            { icon: Tag,   label: "Group",    value: todo.group?.name ?? "—" },
            { icon: Layers,label: "Milestone",value: todo.milestone?.title ?? "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Icon size={12} style={{ color: "var(--text-faint)" }} />
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-faint)" }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Labels */}
        {todo.labels?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "var(--s6)" }}>
            {todo.labels.map(l => (
              <span key={l.id} className="pill" style={{ background: l.color + "22", color: l.color, border: `1px solid ${l.color}44` }}>
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Sub-tasks */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "var(--s5)", marginBottom: "var(--s6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--s3)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Sub-tasks</h3>
            {totalCount > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>
                {doneCount}/{totalCount} · {progress}%
              </span>
            )}
          </div>

          {totalCount > 0 && (
            <div style={{ height: 3, background: "var(--bg-inset)", borderRadius: "var(--r-full)", overflow: "hidden", marginBottom: "var(--s4)" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "var(--black)", borderRadius: "var(--r-full)", transition: "width .4s" }} />
            </div>
          )}

          {todo.sub_tasks?.map(st => (
            <SubTaskInline key={st.id} subTask={st} todoId={todoId} />
          ))}

          <AddSubTask todoId={todoId} />
        </div>

        {/* Reminder */}
        {todo.reminder && (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: "var(--s5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)" }}>
                {todo.reminder.is_enabled ? <Bell size={14} /> : <BellOff size={14} style={{ color: "var(--text-faint)" }} />}
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Reminder</h3>
              </div>
              <button className="btn btn-ghost" onClick={() => toggleReminder.mutate()}>
                {todo.reminder.is_enabled ? "Turn Off" : "Turn On"}
              </button>
            </div>
            {todo.reminder.is_enabled && (
              <div style={{ marginTop: "var(--s3)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {todo.reminder.offset_minutes} min sebelum
                {todo.reminder.remind_at && (
                  <> · {format(new Date(todo.reminder.remind_at), "dd MMM HH:mm")}</>
                )}
                {todo.reminder.is_sent && <span style={{ color: "#22c55e", marginLeft: 8 }}>✓ Terkirim</span>}
              </div>
            )}
          </div>
        )}

      </div>

      {editModal && <TodoModal mode={todoId} onClose={() => { setEditModal(false); qc.invalidateQueries({ queryKey: ["todo-detail", todoId] }); qc.invalidateQueries({ queryKey: ["milestones"] }) }} />}
    </>
  )
}

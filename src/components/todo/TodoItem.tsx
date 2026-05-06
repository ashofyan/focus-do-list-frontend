import { useNavigate } from "react-router-dom"
import { Pin, Trash2, Clock, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { todoApi } from "../../services/api"
import { useToastStore } from "../../stores"

export default function TodoItem({ todo, onEdit }) {
  const navigate = useNavigate()
  const toast    = useToastStore()
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] })
    queryClient.invalidateQueries({ queryKey: ["todos-today-count"] })
    queryClient.invalidateQueries({ queryKey: ["todos-pinned"] })
    queryClient.invalidateQueries({ queryKey: ["todos-stats"] })
    queryClient.invalidateQueries({ queryKey: ["milestones"] })
  }

  const completeMutation = useMutation({
    mutationFn: () => todoApi.complete(todo.id),
    onSuccess: () => {
      invalidate()
      toast.success(todo.status === "completed" ? "Dibatalkan." : "✅ Selesai!")
    },
  })

  const pinMutation = useMutation({
    mutationFn: () => todoApi.pin(todo.id),
    onSuccess:  invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: () => todoApi.remove(todo.id),
    onSuccess: () => { invalidate(); toast.success("Todo dihapus.") },
  })

  const isCompleted = todo.status === "completed"

  const handleCheck = e => {
    e.stopPropagation()
    completeMutation.mutate()
  }

  const handlePin = e => {
    e.stopPropagation()
    pinMutation.mutate()
  }

  const handleDelete = e => {
    e.stopPropagation()
    if (confirm(`Hapus "${todo.title}"?`)) deleteMutation.mutate()
  }

  const handleNavigate = () => navigate(`/tasks/${todo.id}`)

  return (
    <div
      className={`todo-item${isCompleted ? " completed" : ""}`}
      onClick={handleNavigate}
    >
      {/* Priority bar */}
      <div className={`todo-priority-bar priority-${todo.priority}`} />

      {/* Checkbox */}
      <div
        className={`todo-check${isCompleted ? " checked" : ""}`}
        onClick={handleCheck}
        role="checkbox"
        aria-checked={isCompleted}
      >
        {isCompleted && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="todo-body">
        <div className="todo-title">{todo.title}</div>
        <div className="todo-meta">
          {todo.due_date && (
            <span className="todo-time">
              <Clock size={10} style={{ display: "inline", marginRight: 3 }} />
              {format(new Date(todo.due_date), "HH:mm")}
            </span>
          )}
          {todo.group && <span className="todo-label-chip">{todo.group.name}</span>}
          {todo.milestone && <span className="todo-label-chip" style={{ background: "var(--bg-inset)", color: "var(--primary)" }}>🏁 {todo.milestone.title}</span>}
          {todo.labels?.slice(0, 2).map(l => (
            <span key={l.id} className="todo-label-chip">{l.name}</span>
          ))}
          {todo.sub_tasks?.length > 0 && (
            <span className="todo-time">
              {todo.sub_tasks.filter(s => s.is_completed).length}/{todo.sub_tasks.length} subtask
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        className={`todo-pin-btn${todo.is_pinned ? " pinned" : ""}`}
        onClick={handlePin}
        title={todo.is_pinned ? "Unpin" : "Pin"}
      >
        <Pin size={13} />
      </button>

      <button
        className="todo-pin-btn"
        onClick={handleDelete}
        title="Hapus"
        style={{ color: "var(--gray-300)" }}
      >
        <Trash2 size={13} />
      </button>

      <ChevronRight size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
    </div>
  )
}

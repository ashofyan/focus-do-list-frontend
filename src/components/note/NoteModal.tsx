import { useState, useEffect } from "react"
import { X, Trash2, Archive, Pin, Save } from "lucide-react"
import { useNoteStore } from "../../stores/notes"
import { useToastStore } from "../../stores"

export default function NoteModal({ note, onClose }) {
  const { addNote, updateNote, deleteNote, archiveNote, togglePin } = useNoteStore()
  const toast = useToastStore()
  const isEdit = !!note

  const [form, setForm] = useState({
    title: note?.decrypted_title || "",
    content: note?.decrypted_content || "",
    tags: note?.note_tag || []
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) return
    
    setLoading(true)
    try {
      if (isEdit) {
        await updateNote(note.id, form.title, form.content, form.tags)
        toast.success("Note updated!")
      } else {
        await addNote(form.title, form.content, form.tags)
        toast.success("Note created!")
      }
      onClose()
    } catch (e) {
      toast.error("Failed to save note.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 800, width: "95%", height: "80vh", display: "flex", flexDirection: "column" }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Secure Note" : "New Secure Note"}</h2>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {isEdit && (
              <>
                <button className="btn-icon" onClick={() => { togglePin(note.id); onClose() }} title="Toggle Pin">
                  <Pin size={16} fill={note.is_pinned ? "currentColor" : "none"} />
                </button>
                <button className="btn-icon" onClick={() => { archiveNote(note.id); onClose() }} title="Archive">
                  <Archive size={16} />
                </button>
                <button className="btn-icon" onClick={() => { if(confirm("Delete?")) { deleteNote(note.id); onClose(); } }} title="Delete">
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button className="btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="modal-body" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
            <input
              className="form-input"
              placeholder="Title (optional)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ fontSize: 20, fontWeight: 600, border: "none", background: "none", padding: 0 }}
            />
            
            <textarea
              className="form-input"
              placeholder="Write your secure note here..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              style={{
                flex: 1,
                border: "none",
                background: "none",
                padding: 0,
                resize: "none",
                fontSize: 15,
                lineHeight: 1.6
              }}
              autoFocus={!isEdit}
            />
          </div>

          <div className="modal-footer">
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
              {isEdit ? `Last updated: ${new Date(note.updated_at).toLocaleString()}` : "E2E Encrypted"}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Discard</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !form.content.trim()}>
                {loading ? "Encrypting..." : (isEdit ? "Save Changes" : "Create Note")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

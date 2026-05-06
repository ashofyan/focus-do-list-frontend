import { useState, useEffect } from "react"
import { Plus, Search, Lock, Unlock, Archive, Trash2, Pin, ArrowLeft, MoreVertical, X } from "lucide-react"
import { useNoteStore } from "../stores/notes"
import { useToastStore } from "../stores"
import NoteModal from "../components/note/NoteModal"

export default function NotesPage() {
  const { notes, isLocked, loading, unlock, lock, fetchNotes, togglePin, archiveNote, deleteNote, restoreNote } = useNoteStore()
  const toast = useToastStore()
  const [password, setPassword] = useState("")
  const [modal, setModal] = useState<null | "create" | any>(null)
  const [filter, setFilter] = useState<"all" | "pinned" | "archived" | "deleted">("all")
  const [search, setSearch] = useState("")

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    try {
      await unlock(password)
      toast.success("Vault unlocked!")
    } catch (e: any) {
      if (e.message === "INVALID_PIN") {
        toast.error("PIN salah atau vault tidak bisa dibuka.")
      } else {
        toast.error("Gagal membuka vault.")
      }
    }
  }

  useEffect(() => {
    if (!isLocked) {
      const params: any = {}
      if (filter === "archived") params.archived = 1
      if (filter === "deleted") params.deleted = 1
      if (filter === "pinned") params.pinned = 1
      fetchNotes(params)
    }
  }, [filter, isLocked])

  const filteredNotes = notes.filter(n => {
    if (search) {
      const titleMatch = n.decrypted_title?.toLowerCase().includes(search.toLowerCase())
      const contentMatch = n.decrypted_content?.toLowerCase().includes(search.toLowerCase())
      return titleMatch || contentMatch
    }
    return true
  })

  if (isLocked) {
    return (
      <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <div style={{ maxWidth: 400, width: "100%", padding: "var(--s8)", background: "var(--bg-inset)", borderRadius: "var(--r-xl)", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: "var(--black)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--s6)" }}>
            <Lock size={32} color="var(--white)" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: "var(--s2)" }}>Secure Vault</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14, marginBottom: "var(--s6)" }}>Enter your password to decrypt your secure notes.</p>
          
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              className="form-input"
              placeholder="Vault Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              style={{ marginBottom: "var(--s4)", textAlign: "center" }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Unlocking..." : "Unlock Vault"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Secure Notes</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={lock}><Lock size={14} /> Lock Vault</button>
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            <Plus size={14} /> New Note
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="filters-row" style={{ display: "flex", gap: "var(--s3)", marginBottom: "var(--s6)", flexWrap: "wrap", alignItems: "center" }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
            <Search size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            <input placeholder="Search decrypted notes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display: "flex", background: "var(--bg-inset)", padding: 4, borderRadius: 8, gap: 4 }}>
            {[
              { id: "all", label: "All" },
              { id: "pinned", label: "Pinned" },
              { id: "archived", label: "Archived" },
              { id: "deleted", label: "Trash" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: filter === f.id ? "var(--black)" : "transparent",
                  color: filter === f.id ? "var(--white)" : "var(--text-muted)",
                  fontWeight: 600
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="note-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--s4)" }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12 }} />)}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Lock size={20} /></div>
            <div className="empty-title">No notes found</div>
            <div className="empty-desc">Create your first encrypted note.</div>
          </div>
        ) : (
          <div className="note-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--s4)" }}>
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="note-card"
                onClick={() => setModal(note)}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "var(--s4)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: note.decrypt_error ? "var(--error)" : "inherit" }}>
                    {note.decrypt_error ? "Unable to decrypt" : (note.decrypted_title || "Untitled")}
                  </h3>
                  <button
                    className="btn-icon"
                    onClick={e => { e.stopPropagation(); togglePin(note.id) }}
                    style={{ color: note.is_pinned ? "var(--black)" : "var(--gray-300)" }}
                  >
                    <Pin size={14} fill={note.is_pinned ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <p style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.5,
                  flex: 1
                }}>
                  {note.decrypt_error ? "This note is locked with a different key or data is corrupted." : note.decrypted_content}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 11, color: "var(--text-faint)" }}>
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {filter === "deleted" ? (
                      <button className="btn-icon" onClick={e => { e.stopPropagation(); restoreNote(note.id) }} title="Restore"><Unlock size={12} /></button>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={e => { e.stopPropagation(); archiveNote(note.id) }} title="Archive"><Archive size={12} /></button>
                        <button className="btn-icon" onClick={e => { e.stopPropagation(); deleteNote(note.id) }} title="Delete"><Trash2 size={12} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <NoteModal
          note={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

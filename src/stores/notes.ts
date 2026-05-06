import { create } from "zustand"
import { noteApi } from "../services/api"
import { deriveKey, encrypt, decrypt } from "../services/crypto"
import { EncryptedNote } from "../types"

type NoteState = {
  notes: Array<EncryptedNote>
  vaultKey: any
  isLocked: boolean
  loading: boolean

  unlock: (password: string) => Promise<void>
  lock: () => void
  
  fetchNotes: (params?: any) => Promise<void>
  addNote: (title: string, content: string, tags?: Array<string>) => Promise<void>
  updateNote: (id: string, title: string, content: string, tags?: Array<string>) => Promise<void>
  
  togglePin: (id: string) => Promise<void>
  archiveNote: (id: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  restoreNote: (id: string) => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  vaultKey: null,
  isLocked: true,
  loading: false,

  unlock: async (password: string) => {
    set({ loading: true })
    try {
      const key = await deriveKey(password)
      const { data } = await noteApi.list({ per_page: 5 })
      
      let rawNotes = []
      if (data.success && data.data) {
        if (Array.isArray(data.data)) rawNotes = data.data
        else if (Array.isArray(data.data.data)) rawNotes = data.data.data
        else if (Array.isArray(data.data.items)) rawNotes = data.data.items
      }

      if (rawNotes.length > 0) {
        try {
          const first = rawNotes[0]
          await decrypt(first.encrypted_content, first.note_iv, key)
        } catch (e) {
          throw new Error("INVALID_PIN")
        }
      }

      set({ vaultKey: key, isLocked: false, loading: false })
      await get().fetchNotes()
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  lock: () => {
    set({ vaultKey: null, isLocked: true, notes: [] })
  },

  fetchNotes: async (params = {}) => {
    const { vaultKey } = get()
    if (!vaultKey) return

    set({ loading: true })
    try {
      const { data } = await noteApi.list(params)
      
      let rawNotes = []
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          rawNotes = data.data
        } else if (Array.isArray(data.data.data)) {
          rawNotes = data.data.data
        } else if (Array.isArray(data.data.items)) {
          rawNotes = data.data.items
        }
      }
      
      const decryptedNotes = await Promise.all(rawNotes.map(async (note: any) => {
        try {
          const title = note.encrypted_title ? await decrypt(note.encrypted_title, note.note_iv, vaultKey) : ""
          const content = await decrypt(note.encrypted_content, note.note_iv, vaultKey)
          return { ...note, decrypted_title: title, decrypted_content: content }
        } catch (e) {
          return { ...note, decrypt_error: true }
        }
      }))

      set({ notes: decryptedNotes, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  addNote: async (title, content, tags = []) => {
    const { vaultKey } = get()
    if (!vaultKey) throw new Error("VAULT_LOCKED")

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedTitle = title ? await encrypt(title, vaultKey, iv) : { ciphertext: null }
    const encryptedBody = await encrypt(content, vaultKey, iv)

    const payload = {
      encrypted_title: encryptedTitle.ciphertext,
      encrypted_content: encryptedBody.ciphertext,
      note_iv: encryptedBody.iv,
      note_tag: tags,
      encryption_version: 1
    }

    await noteApi.create(payload)
    await get().fetchNotes()
  },

  updateNote: async (id, title, content, tags = []) => {
    const { vaultKey } = get()
    if (!vaultKey) throw new Error("VAULT_LOCKED")

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedBody = await encrypt(content, vaultKey, iv)
    const encryptedTitle = title ? await encrypt(title, vaultKey, iv) : { ciphertext: null }

    const payload = {
      encrypted_title: encryptedTitle.ciphertext,
      encrypted_content: encryptedBody.ciphertext,
      note_iv: encryptedBody.iv,
      note_tag: tags,
      encryption_version: 1
    }

    await noteApi.update(id, payload)
    await get().fetchNotes()
  },

  togglePin: async (id) => {
    await noteApi.pin(id)
    await get().fetchNotes()
  },

  archiveNote: async (id) => {
    await noteApi.archive(id)
    await get().fetchNotes()
  },

  deleteNote: async (id) => {
    await noteApi.remove(id)
    await get().fetchNotes()
  },

  restoreNote: async (id) => {
    await noteApi.restore(id)
    await get().fetchNotes()
  }
}))

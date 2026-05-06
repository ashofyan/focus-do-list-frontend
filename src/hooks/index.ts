import { useState, useEffect, useRef, useCallback } from 'react'

// ── useDebounce ───────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── useLocalStorage ───────────────────────────────────────────
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch { return initial }
  })
  const set = useCallback(v => {
    setValue(v)
    localStorage.setItem(key, JSON.stringify(v))
  }, [key])
  return [value, set]
}

// ── useClickOutside ───────────────────────────────────────────
export function useClickOutside(handler) {
  const ref = useRef(null)
  useEffect(() => {
    const listener = e => { if (ref.current && !ref.current.contains(e.target)) handler(e) }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [handler])
  return ref
}

// ── useKeyPress ───────────────────────────────────────────────
export function useKeyPress(key, handler) {
  useEffect(() => {
    const listener = e => { if (e.key === key) handler(e) }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler])
}

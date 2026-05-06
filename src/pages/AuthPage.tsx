import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore, useToastStore } from '../stores'

function AuthForm({ isRegister }) {
  const navigate = useNavigate()
  const { login, register } = useAuthStore()
  const toast = useToastStore()

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register(form)
      } else {
        await login(form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal. Periksa kembali data Anda.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          Focus<span>Do</span>List
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Your name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoFocus={!isRegister}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={e => set('password_confirmation', e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 13, marginTop: 'var(--s2)' }}
            disabled={loading}
          >
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--s6)', fontSize: 12, color: 'var(--text-muted)' }}>
          {isRegister ? (
            <>Already have an account? <Link to="/login" style={{ color: 'var(--text)', fontWeight: 600 }}>Sign in</Link></>
          ) : (
            <>Don't have an account? <Link to="/register" style={{ color: 'var(--text)', fontWeight: 600 }}>Register</Link></>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoginPage()    { return <AuthForm isRegister={false} /> }
export function RegisterPage() { return <AuthForm isRegister={true}  /> }

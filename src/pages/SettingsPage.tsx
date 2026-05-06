import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Lock, User } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuthStore, useToastStore } from '../stores'

export default function SettingsPage() {
  const { user, fetchMe } = useAuthStore()
  const toast = useToastStore()
  const [profileForm, setProfileForm] = useState({ name: '' })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '' })
  }, [user])

  const profileMutation = useMutation({
    mutationFn: () => authApi.updateMe(profileForm),
    onSuccess: () => {
      toast.success('Profil diperbarui.')
      fetchMe()
    },
    onError: () => toast.error('Gagal memperbarui profil.'),
  })

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword(passwordForm),
    onSuccess: () => {
      toast.success('Password diperbarui.')
      setPasswordForm({ current_password: '', new_password: '', password_confirmation: '' })
    },
    onError: () => toast.error('Gagal memperbarui password.'),
  })

  const submitPassword = () => {
    if (passwordForm.new_password !== passwordForm.password_confirmation) {
      toast.error('Konfirmasi password tidak sama.')
      return
    }

    passwordMutation.mutate()
  }

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Settings</h1>
      </div>

      <div className="page-body" style={{ maxWidth: 600 }}>
        <section style={{ marginBottom: 'var(--s10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
            <User size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400 }}>Profile</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: .6, cursor: 'not-allowed' }} />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
          >
            {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
            <Lock size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400 }}>Change Password</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              className="form-input"
              type="password"
              value={passwordForm.current_password}
              onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              value={passwordForm.new_password}
              onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              value={passwordForm.password_confirmation}
              onChange={e => setPasswordForm(f => ({ ...f, password_confirmation: e.target.value }))}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={submitPassword}
            disabled={passwordMutation.isPending}
          >
            {passwordMutation.isPending ? 'Saving...' : 'Change Password'}
          </button>
        </section>
      </div>
    </>
  )
}

import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './stores'
import Sidebar from './components/layout/Sidebar'
import ToastContainer from './components/ui/Toast'
import TodayPage       from './pages/TodayPage'
import CalendarPage    from './pages/CalendarPage'
import StatsPage       from './pages/StatsPage'
import MilestonesPage  from './pages/MilestonesPage'
import TasksPage       from './pages/TasksPage'
import GroupsPage      from './pages/GroupsPage'
import SettingsPage    from './pages/SettingsPage'
import TodoDetailPage  from './pages/TodoDetailPage'
import { LoginPage, RegisterPage } from './pages/AuthPage'

function AppLayout() {
  const { token, user, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [token])

  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/"              element={<TodayPage />} />
        <Route path="/calendar"      element={<CalendarPage />} />
        <Route path="/stats"         element={<StatsPage />} />
        <Route path="/milestones"    element={<MilestonesPage />} />
        <Route path="/tasks"         element={<TasksPage />} />
        <Route path="/tasks/:id"     element={<TodoDetailPage />} />
        <Route path="/groups"        element={<GroupsPage />} />
        <Route path="/settings"      element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

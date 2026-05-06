import { NavLink, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  LayoutDashboard, Calendar, BarChart2, Layers,
  CheckSquare, LogOut, Settings, Tag, Lock
} from "lucide-react"
import { format } from "date-fns"
import { useAuthStore } from "../../stores"
import { todoApi } from "../../services/api"

const NAV = [
  { to: "/",           icon: LayoutDashboard, label: "Today",      badgeKey: "today" },
  { to: "/calendar",   icon: Calendar,        label: "Calendar" },
  { to: "/stats",      icon: BarChart2,       label: "Stats" },
  { to: "/milestones", icon: Layers,          label: "Milestones" },
  { to: "/notes",      icon: Lock,            label: "Notes" },
  { to: "/groups",     icon: Tag,             label: "Groups" },
  { to: "/tasks",      icon: CheckSquare,     label: "All Tasks",  badgeKey: "tasks" },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: todayData } = useQuery({
    queryKey: ["todos-today-count"],
    queryFn: () => todoApi.list({ date: format(new Date(), "yyyy-MM-dd") }).then(r => r.data.data ?? []),
    staleTime: 60_000,
  })

  const todayPending = (todayData ?? []).filter((t: any) => t.status !== "completed").length

  const initials = user?.name
    ? user.name.split(" ").map((w: any) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getBadge = (key: string) => {
    if (key === "today") return todayPending > 0 ? todayPending : null
    return null
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Focus<span>Do</span>List</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>

        {NAV.map(({ to, icon: Icon, label, badgeKey }) => {
          const badge = badgeKey ? getBadge(badgeKey) : null
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-item` + (isActive ? " active" : "")}
            >
              <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span className="nav-text">{label}</span>
              {badge !== null && <span className="nav-badge">{badge}</span>}
            </NavLink>
          )
        })}

        <div className="nav-section-label" style={{ marginTop: 8 }}>Account</div>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item` + (isActive ? " active" : "")}
        >
          <Settings size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span className="nav-text">Settings</span>
        </NavLink>

        <button className="nav-item" onClick={handleLogout}>
          <LogOut size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span className="nav-text">Logout</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name ?? "—"}</div>
          <div className="sidebar-user-email">{user?.email ?? ""}</div>
        </div>
      </div>
    </aside>
  )
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Search, User, LogOut } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio', end: true },
  { to: '/search', icon: Search, label: 'Buscar', end: false },
  { to: '/profile', icon: User, label: 'Perfil', end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden sm:flex flex-col w-64 border-r border-border px-4 py-6 sticky top-0 h-screen justify-between shrink-0">
        <div className="space-y-1">
          <span className="text-xl font-bold px-3 mb-6 block">The Flock</span>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>

        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate">@{user.username}</span>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 max-w-2xl border-r border-border min-h-screen">
        <Outlet />
      </main>

      {/* Right column — desktop only */}
      <div className="hidden lg:block w-80 px-6 py-6 shrink-0">
        <p className="text-muted-foreground text-sm">Sugerencias próximamente</p>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background flex justify-around py-3 z-50">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

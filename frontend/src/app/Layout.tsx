import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Search, User, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useTheme } from '@/lib/useTheme'
import RightSidebar from './RightSidebar'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio', end: true },
  { to: '/search', icon: Search, label: 'Buscar', end: false },
  { to: '/profile', icon: User, label: 'Perfil', end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="flex w-full max-w-[1280px]">

        {/* Left sidebar */}
        <aside className="hidden sm:flex flex-col w-20 lg:w-64 border-r border-border px-2 lg:px-4 py-4 sticky top-0 h-screen justify-between shrink-0">
          <div className="space-y-1">
            {/* Logo */}
            <div className="px-3 py-3 mb-2">
              <span className="hidden lg:block text-xl font-bold">The Flock</span>
              <span className="lg:hidden text-2xl">🐦</span>
            </div>

            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-full transition-colors w-fit lg:w-full ${
                    isActive
                      ? 'font-bold text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-6 w-6 shrink-0 ${isActive ? 'stroke-[2.5]' : ''}`} />
                    <span className="hidden lg:block text-lg">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {user && (
            <div className="space-y-2">
              <NavLink
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-accent transition-colors w-fit lg:w-full"
              >
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="hidden lg:block min-w-0">
                  <p className="text-sm font-bold truncate">@{user.username}</p>
                </div>
              </NavLink>
              <button
                onClick={toggle}
                className="flex items-center gap-4 px-3 py-3 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-fit lg:w-full"
                aria-label="Cambiar tema"
              >
                {theme === 'dark'
                  ? <Sun className="h-6 w-6 shrink-0" />
                  : <Moon className="h-6 w-6 shrink-0" />
                }
                <span className="hidden lg:block text-lg">
                  {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-3 py-3 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-fit lg:w-full"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                <span className="hidden lg:block text-lg">Cerrar sesión</span>
              </button>
            </div>
          )}
        </aside>

        {/* Main content — pb-16 on mobile to clear fixed bottom nav */}
        <main className="flex-1 min-w-0 border-r border-border min-h-screen max-w-[600px] pb-16 sm:pb-0">
          <Outlet />
        </main>

        {/* Right sidebar — desktop only */}
        <div className="hidden lg:block w-80 xl:w-96 px-4 py-4 shrink-0">
          <RightSidebar />
        </div>

      </div>

      {/* Theme toggle — mobile only, top-right corner */}
      <button
        onClick={toggle}
        aria-label="Cambiar tema"
        className="sm:hidden fixed top-2.5 right-3 z-50 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Bottom nav — mobile only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background flex justify-around py-3 z-50">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs ${
                isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground"
        >
          <LogOut className="h-6 w-6" />
          <span>Salir</span>
        </button>
      </nav>
    </div>
  )
}

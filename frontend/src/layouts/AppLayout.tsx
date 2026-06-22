import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSelect } from '../components/LanguageSelect'
import { ThemeToggle } from '../components/ThemeToggle'

const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/courses', labelKey: 'nav.courses', icon: BookOpen },
  { to: '/documents', labelKey: 'nav.documents', icon: FileText },
  { to: '/assignments', labelKey: 'nav.assignments', icon: ClipboardList },
  { to: '/calendar', labelKey: 'nav.calendar', icon: Calendar },
] as const

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-active text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
  ].join(' ')
}

export function AppLayout() {
  const { logout, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSignOut() {
    logout()
    navigate('/login', { replace: true })
  }

  const sidebar = (
  <>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <img
          src="/logo.png"
          alt="StudyBridge logo"
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-foreground">StudyBridge</p>
          <p className="text-xs text-muted-foreground">{t('nav.subtitle')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {user ? (
          <p className="mb-2 truncate px-3 text-xs text-muted-foreground">
            {user.name}
          </p>
        ) : null}
        <LanguageSelect className="mb-2 w-full" />
        <ThemeToggle variant="inline" className="mb-1 w-full" />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {t('nav.signOut')}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="absolute right-3 top-4 rounded-lg p-1 text-muted-foreground hover:bg-accent"
          onClick={() => setMobileOpen(false)}
          aria-label={t('nav.closeMenu')}
        >
          <X className="h-5 w-5" />
        </button>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-white/8 bg-sidebar px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
            aria-label={t('nav.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">StudyBridge</span>
          <LanguageSelect compact className="ml-auto h-9" />
          <ThemeToggle className="h-9 w-9" />
        </header>

        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { blink } from '../../lib/blink'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import {
  Activity,
  LayoutDashboard,
  FlaskConical,
  BarChart3,
  GitCompare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/simulator', icon: FlaskConical, label: 'Policy Simulator' },
  { to: '/results', icon: BarChart3, label: 'Simulation Results' },
  { to: '/comparison', icon: GitCompare, label: 'Scenario Comparison' },
]

interface Props {
  children: React.ReactNode
}

export function DashboardLayout({ children }: Props) {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  async function handleLogout() {
    try {
      await blink.auth.signOut()
      toast.success('Signed out successfully')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
            <Activity className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
          </div>
          <span className="font-bold text-base tracking-tight">PolicyAI</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} style={{ width: '18px', height: '18px' }} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary" />}
              </Link>
            )
          })}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 px-3 py-4 glass-card rounded-xl">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Quick Stats</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ML Model</span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="text-primary font-medium">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dataset</span>
              <span className="text-foreground font-medium">180+ countries</span>
            </div>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 text-xs"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 border-r border-sidebar-border" style={{ background: 'hsl(220 39% 6%)' }}>
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 flex flex-col border-r border-sidebar-border" style={{ background: 'hsl(220 39% 6%)' }}>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">ML Engine Online</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Random Forest v2.4</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

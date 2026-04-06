import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { blink } from '../lib/blink'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Activity, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')

    setLoading(true)
    try {
      await blink.auth.signInWithEmail(email, password)
      toast.success('Welcome back!')
      navigate({ to: '/dashboard' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      toast.error(msg.includes('credentials') ? 'Invalid email or password' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'var(--gradient-primary)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-8 bg-accent" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">PolicyAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your simulator dashboard</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-8 neon-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="researcher@policy.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary/50 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-border focus:border-primary/50 h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          AI-powered policy simulation for policymakers and researchers
        </p>
      </div>
    </div>
  )
}

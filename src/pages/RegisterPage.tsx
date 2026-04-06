import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { blink } from '../lib/blink'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Activity, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName || !email || !password) return toast.error('Please fill in all fields')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')

    setLoading(true)
    try {
      await blink.auth.signUp({ email, password, displayName })
      toast.success('Account created! Welcome to PolicyAI.')
      navigate({ to: '/dashboard' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      toast.error(msg.includes('exists') ? 'An account with this email already exists' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-8" style={{ background: 'var(--gradient-primary)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-6 bg-accent" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">PolicyAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm">Start simulating policy impacts for free</p>
        </div>

        <div className="glass-card rounded-2xl p-8 neon-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Jane Smith"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary/50 h-11"
                required
              />
            </div>

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
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
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

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary/50 h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold mt-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our terms of service
        </p>
      </div>
    </div>
  )
}

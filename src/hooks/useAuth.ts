import { useState, useEffect } from 'react'
import { blink } from '../lib/blink'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user ? {
        id: state.user.id,
        email: state.user.email || '',
        displayName: state.user.displayName || state.user.email?.split('@')[0] || 'User',
      } : null)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  return { user, loading, isAuthenticated: !!user }
}

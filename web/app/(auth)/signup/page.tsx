'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (authError) {
      setError(authError.message || 'Sign up failed. Check that your email is valid and try again.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main>
        <h1>Check your inbox</h1>
        <p>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
          account, then come back to sign in.
        </p>
        <Link href="/login">Back to sign in</Link>
      </main>
    )
  }

  return (
    <main>
      <h1>Create Account</h1>
      <p>
        Already have one? <Link href="/login">Sign in</Link>
      </p>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="email">
            Email
            <br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="pilot@example.com"
            />
          </label>
        </p>
        <p>
          <label htmlFor="password">
            Password
            <br />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </label>
        </p>
        <p>
          <label htmlFor="confirm">
            Confirm Password
            <br />
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
        </p>
        {error && <p><strong>Error:</strong> {error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </main>
  )
}

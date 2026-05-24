import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slowWarning, setSlowWarning] = useState(false)
  const timerRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSlowWarning(false)
    setLoading(true)

    // Show warning after 5 seconds if still waiting
    timerRef.current = setTimeout(() => setSlowWarning(true), 5000)

    try {
      const data = await login(form.email, form.password)
      navigate(data.profile_complete ? '/applications' : '/profile-setup')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      clearTimeout(timerRef.current)
      setLoading(false)
      setSlowWarning(false)
    }
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>JobTracker</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {slowWarning && (
            <div className="auth-slow-warning">
              ☕ Server is waking up, this may take ~30 seconds on first load...
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  )
}

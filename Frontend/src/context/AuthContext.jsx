import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getMe } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await loginUser(email, password)
    localStorage.setItem('token', res.data.access_token)
    const me = await getMe()
    setUser({ ...me.data, profile_complete: res.data.profile_complete })
    return res.data
  }

  const signup = async (email, password) => {
    const res = await registerUser(email, password)
    localStorage.setItem('token', res.data.access_token)
    const me = await getMe()
    setUser({ ...me.data, profile_complete: res.data.profile_complete })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const markProfileComplete = () => {
    setUser(prev => prev ? { ...prev, profile_complete: true } : prev)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, markProfileComplete }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

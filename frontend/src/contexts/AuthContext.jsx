import { createContext, useContext, useMemo, useState } from 'react'
import {
  authService,
  clearStorage,
  readStorage,
  writeStorage,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStorage())

  const user = session?.user ?? null
  const token = session?.token ?? null

  async function login(credentials) {
    const data = await authService.login(credentials)
    writeStorage(data)
    setSession(data)
    return data
  }

  async function register(payload) {
    const data = await authService.register(payload)
    writeStorage(data)
    setSession(data)
    return data
  }

  function logout() {
    clearStorage()
    setSession(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

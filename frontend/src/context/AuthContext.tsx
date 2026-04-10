import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

type Role = 'employee' | 'customer' | null

// Role-scoped localStorage keys so employee and customer JWTs never overwrite each other
const STORAGE = {
  empToken: 'emp_token',
  custToken: 'cust_token',
  activeRole: 'active_role', // sessionStorage only — which role THIS tab is using
}

function getTokenKey(role: Role) {
  return role === 'employee' ? STORAGE.empToken : STORAGE.custToken
}

interface AuthContextType {
  token: string | null
  role: Role
  isAuthenticated: boolean
  isInitialized: boolean
  /** Returns 'conflict' if opposite role already has an active session, otherwise logs in */
  login: (token: string, role: Role) => 'ok' | 'conflict'
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<Role>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only restore session if THIS tab already has an active role set in sessionStorage.
    // sessionStorage survives page reloads but NOT new tabs — so this only fires on reload,
    // never on a fresh tab open. New tabs always start at the login page.
    const activeRole = sessionStorage.getItem(STORAGE.activeRole) as Role
    if (activeRole) {
      const storedToken = localStorage.getItem(getTokenKey(activeRole))
      if (storedToken) {
        console.log(`[Session] Restoring tab session — role: ${activeRole}`)
        setToken(storedToken)
        setRole(activeRole)
        setIsInitialized(true)
        return
      }
      // Token was cleared externally — clean up stale sessionStorage entry
      sessionStorage.removeItem(STORAGE.activeRole)
    }

    console.log('[Session] No active session for this tab')
    setIsInitialized(true)
  }, [])

  const login = useCallback((newToken: string, newRole: Role): 'ok' | 'conflict' => {
    // Conflict only if THIS tab already has an active session with the opposite role.
    // A token sitting in localStorage without a sessionStorage entry is a stale/closed
    // session — it does NOT count as an active conflict.
    const thisTabRole = sessionStorage.getItem(STORAGE.activeRole) as Role
    if (thisTabRole && thisTabRole !== newRole) {
      console.warn(`[Auth] Conflict — this tab already has an active ${thisTabRole} session`)
      return 'conflict'
    }

    console.log(`[Auth] Login successful — role: ${newRole}`)
    localStorage.setItem(getTokenKey(newRole), newToken)
    sessionStorage.setItem(STORAGE.activeRole, newRole ?? 'customer')
    setToken(newToken)
    setRole(newRole)
    return 'ok'
  }, [])

  const logout = useCallback(() => {
    console.log(`[Auth] Logout — role: ${role}`)
    if (role) localStorage.removeItem(getTokenKey(role))
    sessionStorage.removeItem(STORAGE.activeRole)
    setToken(null)
    setRole(null)
  }, [role])

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated: !!token, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

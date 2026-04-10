import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'

// Helper component that exposes context values for assertions
function AuthConsumer() {
  const { token, role, isAuthenticated, isInitialized, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="role">{role ?? 'null'}</span>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
      <span data-testid="isInitialized">{String(isInitialized)}</span>
      <button onClick={() => login('tok-123', 'customer')}>Login Customer</button>
      <button onClick={() => login('tok-456', 'employee')}>Login Employee</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  it('starts with no token and isInitialized=true when storage is empty', () => {
    renderAuth()
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('role').textContent).toBe('null')
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('isInitialized').textContent).toBe('true')
  })

  // ── Session restore ───────────────────────────────────────────────────────

  it('restores employee session when emp_token is in localStorage', () => {
    localStorage.setItem('emp_token', 'stored-emp-token')
    sessionStorage.setItem('active_role', 'employee')
    renderAuth()
    expect(screen.getByTestId('token').textContent).toBe('stored-emp-token')
    expect(screen.getByTestId('role').textContent).toBe('employee')
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
  })

  it('restores customer session when cust_token is in localStorage', () => {
    localStorage.setItem('cust_token', 'stored-cust-token')
    sessionStorage.setItem('active_role', 'customer')
    renderAuth()
    expect(screen.getByTestId('token').textContent).toBe('stored-cust-token')
    expect(screen.getByTestId('role').textContent).toBe('customer')
  })

  it('does NOT auto-inherit employee session in a new tab', () => {
    localStorage.setItem('emp_token', 'emp-inherit')
    // No sessionStorage.active_role — simulates new tab
    renderAuth()
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('role').textContent).toBe('null')
  })

  it('does NOT auto-inherit customer session in a new tab', () => {
    localStorage.setItem('cust_token', 'cust-inherit')
    // No sessionStorage.active_role — simulates new tab
    renderAuth()
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('role').textContent).toBe('null')
  })

  it('cleans up stale sessionStorage if token was removed externally', () => {
    // sessionStorage has a role but the token is gone from localStorage
    sessionStorage.setItem('active_role', 'employee')
    // emp_token NOT in localStorage
    renderAuth()
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(sessionStorage.getItem('active_role')).toBeNull()
  })

  // ── Login ─────────────────────────────────────────────────────────────────

  it('login() stores token and sets role', async () => {
    renderAuth()
    await act(async () => {
      screen.getByText('Login Customer').click()
    })
    expect(screen.getByTestId('token').textContent).toBe('tok-123')
    expect(screen.getByTestId('role').textContent).toBe('customer')
    expect(localStorage.getItem('cust_token')).toBe('tok-123')
    expect(sessionStorage.getItem('active_role')).toBe('customer')
  })

  it('login() returns "conflict" when THIS tab already has the opposite role active', async () => {
    // This tab is already logged in as customer (both sessionStorage + localStorage must be set)
    sessionStorage.setItem('active_role', 'customer')
    localStorage.setItem('cust_token', 'existing-cust')
    let result: string | undefined

    function ConflictConsumer() {
      const { login } = useAuth()
      return (
        <button onClick={() => { result = login('new-emp-tok', 'employee') }}>
          Try Employee Login
        </button>
      )
    }

    render(
      <AuthProvider>
        <ConflictConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Try Employee Login').click()
    })

    expect(result).toBe('conflict')
    expect(localStorage.getItem('emp_token')).toBeNull()
  })

  it('login() returns "ok" even when a stale token from another role exists in localStorage', async () => {
    // Stale cust_token in localStorage (tab was closed without logout) — should NOT block
    localStorage.setItem('cust_token', 'stale-cust')
    let result: string | undefined

    function OkConsumer() {
      const { login } = useAuth()
      return (
        <button onClick={() => { result = login('new-emp-tok', 'employee') }}>
          Employee Login
        </button>
      )
    }

    render(
      <AuthProvider>
        <OkConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Employee Login').click()
    })

    expect(result).toBe('ok')
    expect(localStorage.getItem('emp_token')).toBe('new-emp-tok')
  })

  it('login() returns "ok" when no opposite role token exists', async () => {
    let result: string | undefined

    function OkConsumer() {
      const { login } = useAuth()
      return (
        <button onClick={() => { result = login('emp-tok', 'employee') }}>
          Employee Login
        </button>
      )
    }

    render(
      <AuthProvider>
        <OkConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Employee Login').click()
    })

    expect(result).toBe('ok')
    expect(localStorage.getItem('emp_token')).toBe('emp-tok')
  })

  // ── Logout ────────────────────────────────────────────────────────────────

  it('logout() clears token, role, and storage', async () => {
    renderAuth()
    await act(async () => {
      screen.getByText('Login Customer').click()
    })
    await act(async () => {
      screen.getByText('Logout').click()
    })
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('role').textContent).toBe('null')
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(localStorage.getItem('cust_token')).toBeNull()
    expect(sessionStorage.getItem('active_role')).toBeNull()
  })
})

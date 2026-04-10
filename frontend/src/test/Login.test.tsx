import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import * as api from '../services/api'

// Wrap Login with required providers + destination routes so Navigate doesn't
// cause a "fewer hooks" React error when login succeeds and redirects away.
function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/shop" element={<div>Shop</div>} />
          <Route path="/products" element={<div>Products</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('Login Page', () => {

  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders Customer Login and Employee Login tabs', () => {
    renderLogin()
    expect(screen.getByText('Customer Login')).toBeInTheDocument()
    expect(screen.getByText('Employee Login')).toBeInTheDocument()
  })

  it('shows customer form fields by default', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('shows ShopDesk brand', () => {
    renderLogin()
    expect(screen.getByText('ShopDesk')).toBeInTheDocument()
  })

  it('has a Sign up link', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  // ── Tab Switching ─────────────────────────────────────────────────────────

  it('switching to Employee tab shows Employee ID field', async () => {
    renderLogin()
    await userEvent.click(screen.getByText('Employee Login'))
    expect(screen.getByPlaceholderText('e.g. EMP001')).toBeInTheDocument()
  })

  it('switching back to Customer tab hides Employee ID field', async () => {
    renderLogin()
    await userEvent.click(screen.getByText('Employee Login'))
    await userEvent.click(screen.getByText('Customer Login'))
    expect(screen.queryByPlaceholderText('e.g. EMP001')).not.toBeInTheDocument()
  })

  // ── Customer Form Validation ──────────────────────────────────────────────

  it('shows validation error when customer submits empty form', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /sign in as customer/i }))
    expect(await screen.findByText('Username is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  it('shows validation error when only username is filled', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'Vinod_123')
    await userEvent.click(screen.getByRole('button', { name: /sign in as customer/i }))
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  // ── Employee Form Validation ──────────────────────────────────────────────

  it('shows validation error when employee submits empty form', async () => {
    renderLogin()
    await userEvent.click(screen.getByText('Employee Login'))
    await userEvent.click(screen.getByRole('button', { name: /sign in as employee/i }))
    expect(await screen.findByText('Employee ID is required')).toBeInTheDocument()
    expect(await screen.findByText('Username is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
  })

  // ── API Integration ───────────────────────────────────────────────────────

  it('shows server error on invalid customer credentials', async () => {
    vi.spyOn(api, 'loginUser').mockRejectedValue({
      response: { data: { message: 'Invalid username or password' } },
    })
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'wronguser')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /sign in as customer/i }))
    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument()
  })

  it('shows server error on invalid employee credentials', async () => {
    vi.spyOn(api, 'employeeLoginUser').mockRejectedValue({
      response: { data: { message: 'Invalid employee credentials' } },
    })
    renderLogin()
    await userEvent.click(screen.getByText('Employee Login'))
    await userEvent.type(screen.getByPlaceholderText('e.g. EMP001'), 'EMP999')
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'baduser')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'badpass')
    await userEvent.click(screen.getByRole('button', { name: /sign in as employee/i }))
    expect(await screen.findByText('Invalid employee credentials')).toBeInTheDocument()
  })

  it('calls loginUser with correct credentials on customer submit', async () => {
    const mockLogin = vi.spyOn(api, 'loginUser').mockResolvedValue({
      data: { token: 'fake-token', role: 'customer' },
    } as any)
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'Vinod_123')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'Teju@7731')
    await userEvent.click(screen.getByRole('button', { name: /sign in as customer/i }))
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'Vinod_123', password: 'Teju@7731' })
    })
  })

  it('calls employeeLoginUser with employeeId on employee submit', async () => {
    const mockEmpLogin = vi.spyOn(api, 'employeeLoginUser').mockResolvedValue({
      data: { token: 'emp-token', role: 'employee' },
    } as any)
    renderLogin()
    await userEvent.click(screen.getByText('Employee Login'))
    await userEvent.type(screen.getByPlaceholderText('e.g. EMP001'), 'EMP001')
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'vinod')
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in as employee/i }))
    await waitFor(() => {
      expect(mockEmpLogin).toHaveBeenCalledWith({
        employeeId: 'EMP001', username: 'vinod', password: 'password123',
      })
    })
  })

  // ── Password Toggle ───────────────────────────────────────────────────────

  it('toggles password visibility', async () => {
    renderLogin()
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    const toggleBtn = passwordInput.parentElement?.querySelector('button') as HTMLElement
    await userEvent.click(toggleBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

function renderWithAuth(
  path: string,
  initialEntry: string,
  requiredRole?: 'employee' | 'customer'
) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
            <Route path={path} element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/shop" element={<div>Shop Page</div>} />
          <Route path="/products" element={<div>Products Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('redirects unauthenticated user to /login', () => {
    renderWithAuth('/products', '/products', 'employee')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects unauthenticated customer to /login', () => {
    renderWithAuth('/shop', '/shop', 'customer')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders outlet when employee accesses employee-only route', () => {
    localStorage.setItem('emp_token', 'emp-tok')
    sessionStorage.setItem('active_role', 'employee')
    renderWithAuth('/products', '/products', 'employee')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders outlet when customer accesses customer-only route', () => {
    localStorage.setItem('cust_token', 'cust-tok')
    sessionStorage.setItem('active_role', 'customer')
    renderWithAuth('/shop', '/shop', 'customer')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders outlet when no requiredRole is set', () => {
    localStorage.setItem('cust_token', 'cust-tok')
    sessionStorage.setItem('active_role', 'customer')
    renderWithAuth('/shop', '/shop')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects customer to /shop when accessing employee route', () => {
    localStorage.setItem('cust_token', 'cust-tok')
    sessionStorage.setItem('active_role', 'customer')
    renderWithAuth('/products', '/products', 'employee')
    expect(screen.getByText('Shop Page')).toBeInTheDocument()
  })

  it('redirects employee to /products when accessing customer route', () => {
    localStorage.setItem('emp_token', 'emp-tok')
    sessionStorage.setItem('active_role', 'employee')
    renderWithAuth('/shop', '/shop', 'customer')
    expect(screen.getByText('Products Page')).toBeInTheDocument()
  })
})

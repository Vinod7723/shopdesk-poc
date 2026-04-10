import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import OrderHistory from '../pages/OrderHistory'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import type { Order } from '../types'

const mockOrder: Order = {
  id: 'ORD-1234567890',
  placedAt: new Date('2026-01-15T10:30:00').toISOString(),
  items: [
    {
      productId: 1,
      title: 'Blue Shirt',
      price: 29.99,
      quantity: 2,
      image: 'https://example.com/shirt.jpg',
      category: 'clothing',
    },
  ],
  total: 59.98,
  shipping: {
    fullName: 'John Doe',
    address: '123 Main St',
    city: 'Chicago',
    zip: '60601',
    country: 'US',
  },
}

function renderOrderHistory() {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <OrderHistory />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  )
}

describe('OrderHistory Page', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('shows empty state when no orders exist', () => {
    renderOrderHistory()
    expect(screen.getByText(/you haven't placed any orders yet/i)).toBeInTheDocument()
  })

  it('shows Start Shopping button on empty state', () => {
    renderOrderHistory()
    expect(screen.getByRole('button', { name: /start shopping/i })).toBeInTheDocument()
  })

  it('shows correct order count when orders exist', () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    expect(screen.getByText(/1 order placed/i)).toBeInTheDocument()
  })

  it('shows order ID in the list', () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    expect(screen.getByText('ORD-1234567890')).toBeInTheDocument()
  })

  it('shows order total', () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    expect(screen.getByText('$59.98')).toBeInTheDocument()
  })

  it('shows Delivered badge for each order', () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
  })

  it('expands order details when header is clicked', async () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    await userEvent.click(screen.getByText('ORD-1234567890'))
    expect(screen.getByText('Blue Shirt')).toBeInTheDocument()
    expect(screen.getByText('Items Ordered')).toBeInTheDocument()
    expect(screen.getByText('Shipped To')).toBeInTheDocument()
  })

  it('collapses order details on second click', async () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    await userEvent.click(screen.getByText('ORD-1234567890'))
    await userEvent.click(screen.getByText('ORD-1234567890'))
    expect(screen.queryByText('Items Ordered')).not.toBeInTheDocument()
  })

  it('shows shipping address when expanded', async () => {
    localStorage.setItem('orders', JSON.stringify([mockOrder]))
    renderOrderHistory()
    await userEvent.click(screen.getByText('ORD-1234567890'))
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it('shows plural orders count for multiple orders', () => {
    const order2 = { ...mockOrder, id: 'ORD-9999999999', placedAt: new Date('2026-02-01').toISOString() }
    localStorage.setItem('orders', JSON.stringify([mockOrder, order2]))
    renderOrderHistory()
    expect(screen.getByText('2 orders placed')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import Cart from '../pages/Cart'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 1,
  title: 'Blue Shirt',
  price: 29.99,
  description: 'A shirt',
  category: 'clothing',
  image: 'https://example.com/shirt.jpg',
  stock: 3,
}

const mockProduct2: Product = {
  id: 2,
  title: 'Red Shoes',
  price: 49.99,
  description: 'Some shoes',
  category: 'shoes',
  image: 'https://example.com/shoes.jpg',
  stock: 5,
}

function preloadCart(items: { product: Product; quantity: number }[]) {
  sessionStorage.setItem('cart', JSON.stringify(items))
}

function renderCart() {
  return render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <Cart />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  )
}

describe('Cart Page', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('shows empty state when cart is empty', () => {
    renderCart()
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('shows Browse Products button on empty cart', () => {
    renderCart()
    expect(screen.getByRole('button', { name: /browse products/i })).toBeInTheDocument()
  })

  it('shows item title when cart has items', () => {
    preloadCart([{ product: mockProduct, quantity: 1 }])
    renderCart()
    expect(screen.getByText('Blue Shirt')).toBeInTheDocument()
  })

  it('shows correct total items count in heading', () => {
    preloadCart([{ product: mockProduct, quantity: 2 }])
    renderCart()
    // heading shows "(2 items)" — use getAllByText since summary also shows "2 items"
    const matches = screen.getAllByText(/2 items/)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows + button disabled when quantity reaches stock limit', () => {
    preloadCart([{ product: mockProduct, quantity: 3 }])
    renderCart()
    const plusBtn = screen.getByRole('button', { name: '+' })
    expect(plusBtn).toBeDisabled()
  })

  it('shows max stock warning at stock limit', () => {
    preloadCart([{ product: mockProduct, quantity: 3 }])
    renderCart()
    expect(screen.getByText(/max stock: 3/i)).toBeInTheDocument()
  })

  it('removes item when Remove is clicked', async () => {
    preloadCart([{ product: mockProduct, quantity: 1 }])
    renderCart()
    await userEvent.click(screen.getByText('Remove'))
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('shows Proceed to Checkout button when cart has items', () => {
    preloadCart([{ product: mockProduct, quantity: 1 }])
    renderCart()
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument()
  })

  it('shows Order Summary section', () => {
    preloadCart([{ product: mockProduct, quantity: 1 }])
    renderCart()
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
  })

  it('calculates correct total for multiple items', () => {
    preloadCart([
      { product: mockProduct, quantity: 1 },
      { product: mockProduct2, quantity: 1 },
    ])
    renderCart()
    // 29.99 + 49.99 = 79.98
    expect(screen.getByText('$79.98')).toBeInTheDocument()
  })
})

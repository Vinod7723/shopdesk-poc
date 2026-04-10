import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { CartProvider, useCart } from '../context/CartContext'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 1,
  title: 'Test Shirt',
  price: 29.99,
  description: 'A test product',
  category: 'clothing',
  image: 'https://example.com/shirt.jpg',
  stock: 5,
}

const mockProduct2: Product = {
  id: 2,
  title: 'Test Shoes',
  price: 59.99,
  description: 'Another test product',
  category: 'shoes',
  image: 'https://example.com/shoes.jpg',
  stock: 3,
}

function CartConsumer() {
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  return (
    <div>
      <span data-testid="item-count">{totalItems}</span>
      <span data-testid="total-price">{totalPrice.toFixed(2)}</span>
      <span data-testid="items-json">{JSON.stringify(items)}</span>
      <button onClick={() => addToCart(mockProduct)}>Add Product 1</button>
      <button onClick={() => addToCart(mockProduct2)}>Add Product 2</button>
      <button onClick={() => removeFromCart(1)}>Remove Product 1</button>
      <button onClick={() => updateQuantity(1, 3)}>Set Qty 3</button>
      <button onClick={() => updateQuantity(1, 0)}>Set Qty 0</button>
      <button onClick={() => clearCart()}>Clear</button>
    </div>
  )
}

function renderCart() {
  return render(
    <CartProvider>
      <CartConsumer />
    </CartProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  it('starts with empty cart', () => {
    renderCart()
    expect(screen.getByTestId('item-count').textContent).toBe('0')
    expect(screen.getByTestId('total-price').textContent).toBe('0.00')
  })

  // ── addToCart ─────────────────────────────────────────────────────────────

  it('adds a product to cart', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    expect(screen.getByTestId('item-count').textContent).toBe('1')
    expect(screen.getByTestId('total-price').textContent).toBe('29.99')
  })

  it('increments quantity when same product is added again', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Add Product 1').click() })
    expect(screen.getByTestId('item-count').textContent).toBe('2')
    const items = JSON.parse(screen.getByTestId('items-json').textContent!)
    expect(items[0].quantity).toBe(2)
  })

  it('adds multiple different products', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Add Product 2').click() })
    expect(screen.getByTestId('item-count').textContent).toBe('2')
    const items = JSON.parse(screen.getByTestId('items-json').textContent!)
    expect(items.length).toBe(2)
  })

  // ── removeFromCart ────────────────────────────────────────────────────────

  it('removes a product from cart', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Remove Product 1').click() })
    expect(screen.getByTestId('item-count').textContent).toBe('0')
  })

  // ── updateQuantity ────────────────────────────────────────────────────────

  it('updates quantity to specified value', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Set Qty 3').click() })
    const items = JSON.parse(screen.getByTestId('items-json').textContent!)
    expect(items[0].quantity).toBe(3)
    expect(screen.getByTestId('item-count').textContent).toBe('3')
  })

  it('removes item when quantity set to 0', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Set Qty 0').click() })
    expect(screen.getByTestId('item-count').textContent).toBe('0')
    const items = JSON.parse(screen.getByTestId('items-json').textContent!)
    expect(items.length).toBe(0)
  })

  // ── clearCart ─────────────────────────────────────────────────────────────

  it('clears all items from cart', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Add Product 2').click() })
    await act(async () => { screen.getByText('Clear').click() })
    expect(screen.getByTestId('item-count').textContent).toBe('0')
    expect(screen.getByTestId('total-price').textContent).toBe('0.00')
  })

  // ── totalPrice ────────────────────────────────────────────────────────────

  it('calculates total price correctly for multiple items', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    await act(async () => { screen.getByText('Add Product 2').click() })
    // 29.99 + 59.99 = 89.98
    expect(screen.getByTestId('total-price').textContent).toBe('89.98')
  })

  // ── sessionStorage persistence ────────────────────────────────────────────

  it('persists cart to sessionStorage on change', async () => {
    renderCart()
    await act(async () => { screen.getByText('Add Product 1').click() })
    const stored = JSON.parse(sessionStorage.getItem('cart') || '[]')
    expect(stored.length).toBe(1)
    expect(stored[0].product.id).toBe(1)
  })

  it('restores cart from sessionStorage on mount', () => {
    const saved = [{ product: mockProduct, quantity: 2 }]
    sessionStorage.setItem('cart', JSON.stringify(saved))
    renderCart()
    expect(screen.getByTestId('item-count').textContent).toBe('2')
  })
})

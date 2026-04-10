import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCart } from '../context/CartContext'
import { updateProduct } from '../services/api'
import type { Order } from '../types'
import CustomerNavbar from '../components/CustomerNavbar'

function saveOrder(order: Order) {
  const key = 'orders'
  const existing: Order[] = JSON.parse(localStorage.getItem(key) || '[]')
  existing.unshift(order) // newest first
  localStorage.setItem(key, JSON.stringify(existing))
}

interface CheckoutForm {
  fullName: string
  address: string
  city: string
  zip: string
  country: string
  cardName: string
  cardNumber: string
  expiry: string
  cvv: string
}

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const [placed, setPlaced] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>()

  const onSubmit = async (data: CheckoutForm) => {
    console.log('[Checkout] Order placed:', { items: totalItems, total: totalPrice.toFixed(2), shipping: data.address })
    // Deduct stock for each ordered item
    await Promise.all(
      items.map((item) =>
        updateProduct(item.product.id, {
          title: item.product.title,
          price: item.product.price,
          stock: Math.max(0, item.product.stock - item.quantity),
          description: item.product.description,
          category: item.product.category,
          image: item.product.image,
        })
      )
    )
    // Save order to history
    const order: Order = {
      id: `ORD-${Date.now()}`,
      placedAt: new Date().toISOString(),
      total: totalPrice,
      shipping: {
        fullName: data.fullName,
        address: data.address,
        city: data.city,
        zip: data.zip,
        country: data.country,
      },
      items: items.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        image: i.product.image,
        category: i.product.category,
        price: i.product.price,
        quantity: i.quantity,
      })),
    }
    saveOrder(order)
    clearCart()
    setPlaced(true)
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">Thank you for your purchase. Your order is on its way.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/cart')} className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-6">
          ← Back to Cart
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Shipping + Payment */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                      {...register('fullName', { required: 'Full name is required' })}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      placeholder="123 Main St"
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                      {...register('address', { required: 'Address is required' })}
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                      <input
                        type="text"
                        placeholder="Chicago"
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        {...register('city', { required: 'City is required' })}
                      />
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
                      <input
                        type="text"
                        placeholder="60601"
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.zip ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        {...register('zip', { required: 'ZIP is required', pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Invalid ZIP' } })}
                      />
                      {errors.zip && <p className="mt-1 text-xs text-red-500">{errors.zip.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <select
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 focus:bg-white ${errors.country ? 'border-red-400' : 'border-gray-200'}`}
                      {...register('country', { required: 'Country is required' })}
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                    </select>
                    {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Payment Details</h2>
                </div>

                {/* Card brand icons */}
                <div className="flex items-center gap-2 mb-5">
                  {['VISA', 'MC', 'AMEX'].map((brand) => (
                    <span key={brand} className="text-xs font-bold border border-gray-200 rounded px-2 py-0.5 text-gray-500 bg-gray-50">{brand}</span>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name on Card</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                      {...register('cardName', { required: 'Name on card is required' })}
                    />
                    {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition font-mono tracking-widest ${errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                      {...register('cardNumber', {
                        required: 'Card number is required',
                        pattern: { value: /^[\d\s]{19}$/, message: 'Enter a valid 16-digit card number' },
                        onChange: (e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                          e.target.value = v.replace(/(.{4})/g, '$1 ').trim()
                        },
                      })}
                    />
                    {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        {...register('expiry', {
                          required: 'Expiry is required',
                          pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Use MM/YY format' },
                          onChange: (e) => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                            if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                            e.target.value = v
                          },
                        })}
                      />
                      {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        {...register('cvv', {
                          required: 'CVV is required',
                          pattern: { value: /^\d{3,4}$/, message: '3 or 4 digits' },
                        })}
                      />
                      {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.product.image} alt={item.product.title} referrerPolicy="no-referrer" className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 font-medium line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Confirm & Pay
                </button>

                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secured with SSL encryption
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

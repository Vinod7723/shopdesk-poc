import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order } from '../types'
import CustomerNavbar from '../components/CustomerNavbar'

function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem('orders') || '[]')
  } catch {
    return []
  }
}

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders] = useState<Order[]>(loadOrders)
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/shop')} className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-6">
          ← Back to Shop
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Order header */}
                <button
                  onClick={() => toggle(order.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{order.id}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.placedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Delivered
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                {expanded === order.id && (
                  <div className="border-t border-gray-100 px-6 py-4 space-y-4">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                              <p className="text-xs text-indigo-500 capitalize">{item.category}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-xs text-gray-400">${item.price.toFixed(2)} × {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    <div className="border-t border-gray-50 pt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Shipped To</p>
                      <p className="text-sm text-gray-700">
                        {order.shipping.fullName} — {order.shipping.address}, {order.shipping.city}, {order.shipping.zip}, {order.shipping.country}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Order Total</span>
                      <span className="text-base font-bold text-indigo-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

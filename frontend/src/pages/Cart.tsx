import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CustomerNavbar from '../components/CustomerNavbar'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/shop')} className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
            ← Back to Shop
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Your Cart <span className="text-gray-400 text-lg font-normal">({totalItems} items)</span>
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Your cart is empty</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.product.image} alt={item.product.title} referrerPolicy="no-referrer" className="w-full h-full object-contain p-2" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-500 capitalize font-medium">{item.product.category}</p>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5">{item.product.title}</p>
                    <p className="text-base font-bold text-gray-900 mt-1">${item.product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {item.quantity >= item.product.stock && (
                      <p className="text-xs text-red-500 font-medium">Max stock: {item.product.stock}</p>
                    )}

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span className="line-clamp-1 flex-1 pr-2">{item.product.title} × {item.quantity}</span>
                      <span className="font-medium flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mb-5">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{totalItems} items</p>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

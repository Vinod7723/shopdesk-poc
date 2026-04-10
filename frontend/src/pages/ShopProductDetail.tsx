import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProductById } from '../services/api'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import CustomerNavbar from '../components/CustomerNavbar'

export default function ShopProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const [stockWarning, setStockWarning] = useState('')
  const { addToCart, items: cartItems } = useCart()

  useEffect(() => {
    if (!id) return
    fetchProductById(Number(id))
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found or failed to load.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    const cartItem = cartItems.find((i) => i.product.id === product.id)
    const currentQty = cartItem?.quantity ?? 0
    if (currentQty >= product.stock) {
      setStockWarning(`Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available`)
      setTimeout(() => setStockWarning(''), 2500)
      return
    }
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-1 text-indigo-600 hover:underline text-sm mb-6"
        >
          ← Back to Shop
        </button>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {product && (
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col md:flex-row gap-10">
            {/* Image */}
            <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-2xl p-6 md:w-80 md:h-80">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="max-h-64 max-w-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full capitalize font-medium">
                {product.category}
              </span>

              <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.title}</h1>

              <p className="text-3xl font-extrabold text-indigo-600">${product.price.toFixed(2)}</p>

              {/* Stock status */}
              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                    Only {product.stock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    In Stock
                  </span>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : added
                      ? 'bg-green-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {product.stock === 0 ? (
                    'Out of Stock'
                  ) : added ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                {stockWarning && (
                  <p className="text-xs text-red-500 font-medium text-center">⚠ {stockWarning}</p>
                )}

                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

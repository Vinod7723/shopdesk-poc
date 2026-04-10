import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProductById } from '../services/api'
import type { Product } from '../types'
import Navbar from '../components/Navbar'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetchProductById(Number(id))
      .then((res) => {
        console.log(`[ProductDetail] Loaded: "${res.data.title}"`)
        setProduct(res.data)
      })
      .catch(() => {
        console.error(`[ProductDetail] Failed to load product ID: ${id}`)
        setError('Product not found or failed to load.')
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1 text-indigo-600 hover:underline text-sm mb-6"
        >
          ← Back to Products
        </button>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {product && (
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col md:flex-row gap-10">
            <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl p-6 md:w-72 md:h-72">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="max-h-56 max-w-full object-contain"
              />
            </div>

            <div className="flex-1 space-y-4">
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full capitalize font-medium">
                {product.category}
              </span>

              <h1 className="text-2xl font-bold text-gray-800 leading-snug">{product.title}</h1>

              <p className="text-3xl font-extrabold text-indigo-600">${product.price.toFixed(2)}</p>

              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                    Low Stock — {product.stock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    In Stock — {product.stock} units
                  </span>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium text-gray-700">{product.rating.rate}</span>
                  <span>({product.rating.count} reviews)</span>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

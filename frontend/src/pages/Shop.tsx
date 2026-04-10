import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/api'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import CustomerNavbar from '../components/CustomerNavbar'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [addedIds, setAddedIds] = useState<number[]>([])
  const [stockWarnings, setStockWarnings] = useState<Record<number, string>>({})
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12
  const { addToCart, items: cartItems } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
      .then((res) => setProducts(res.data))
      .catch(() => console.error('[Shop] Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map((p) => p.category)))]
  }, [products])

  const filtered = useMemo(() => {
    setPage(1) // reset to page 1 whenever filter changes
    return products.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAddToCart = (product: Product) => {
    const cartItem = cartItems.find((i) => i.product.id === product.id)
    const currentQty = cartItem?.quantity ?? 0
    if (currentQty >= product.stock) {
      setStockWarnings((prev) => ({ ...prev, [product.id]: `Only ${product.stock} in stock` }))
      setTimeout(() => setStockWarnings((prev) => { const n = { ...prev }; delete n[product.id]; return n }), 2500)
      return
    }
    addToCart(product)
    setAddedIds((prev) => [...prev, product.id])
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Store</h1>
          <p className="text-gray-500 mt-1">{filtered.length} products available</p>
          {totalPages > 1 && <p className="text-xs text-gray-400 mt-0.5">Page {page} of {totalPages}</p>}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-64"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {/* Product grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                {/* Product image */}
                <div
                  className="aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/shop/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-indigo-500 font-medium capitalize">{product.category}</span>
                    {product.stock === 0 ? (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                    ) : product.stock <= 5 ? (
                      <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Only {product.stock} left</span>
                    ) : null}
                  </div>
                  <h3
                    className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate(`/shop/${product.id}`)}
                  >
                    {product.title}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      product.stock === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : addedIds.includes(product.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {product.stock === 0 ? (
                      'Out of Stock'
                    ) : addedIds.includes(product.id) ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added!
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

                  {stockWarnings[product.id] && (
                    <p className="mt-2 text-xs text-center text-red-500 font-medium">
                      ⚠ {stockWarnings[product.id]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 text-sm rounded-lg font-semibold transition ${
                      page === p
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

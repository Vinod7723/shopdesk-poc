import { useEffect, useReducer, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProduct } from '../services/api'
import type { Product } from '../types'
import Navbar from '../components/Navbar'

// ── useReducer: all product list state in one place ──────────────────────────
interface State {
  products: Product[]
  loading: boolean
  error: string
  deletingId: number | null
}

type Action =
  | { type: 'FETCH_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_ERROR' }
  | { type: 'DELETE_START'; payload: number }
  | { type: 'DELETE_SUCCESS'; payload: number }
  | { type: 'DELETE_ERROR' }

const initialState: State = {
  products: [],
  loading: true,
  error: '',
  deletingId: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: 'Failed to load products. Please try again.' }
    case 'DELETE_START':
      return { ...state, deletingId: action.payload }
    case 'DELETE_SUCCESS':
      return { ...state, deletingId: null, products: state.products.filter((p) => p.id !== action.payload) }
    case 'DELETE_ERROR':
      return { ...state, deletingId: null }
    default:
      return state
  }
}

function ProductThumb({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={title}
      referrerPolicy="no-referrer"
      className="w-9 h-9 object-contain rounded flex-shrink-0"
      onError={() => setFailed(true)}
    />
  )
}

export default function ProductList() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { products, loading, error, deletingId } = state
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  // useMemo — only recalculates filtered list when products or search term changes
  const filteredProducts = useMemo(() => {
    setPage(1)
    const term = search.toLowerCase().trim()
    if (!term) return products
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    )
  }, [products, search])

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE)
  const paginated = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    fetchProducts()
      .then((res) => {
        console.log(`[ProductList] Loaded ${res.data.length} products`)
        dispatch({ type: 'FETCH_SUCCESS', payload: res.data })
      })
      .catch(() => {
        console.error('[ProductList] Failed to load products')
        dispatch({ type: 'FETCH_ERROR' })
      })
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    dispatch({ type: 'DELETE_START', payload: id })
    try {
      await deleteProduct(id)
      console.log(`[ProductList] Product ${id} deleted`)
      dispatch({ type: 'DELETE_SUCCESS', payload: id })
    } catch {
      console.error(`[ProductList] Failed to delete product ${id}`)
      dispatch({ type: 'DELETE_ERROR' })
      alert('Delete failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stock summary cards */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                <p className="text-xs text-gray-500">Total Products in Stock</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {[...new Set(products.map((p) => p.category))].length}
                </p>
                <p className="text-xs text-gray-500">Categories Available</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  ${Math.min(...products.map((p) => p.price)).toFixed(2)}
                  <span className="text-sm font-normal text-gray-400"> – </span>
                  ${Math.max(...products.map((p) => p.price)).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Price Range</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>
            <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} products total {totalPages > 1 && `— Page ${page} of ${totalPages}`}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category..."
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-64"
            />
            <button
              onClick={() => navigate('/products/new')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              + Add Product
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <><div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left w-28">Price</th>
                    <th className="px-4 py-3 text-left w-28">Stock</th>
                    <th className="px-4 py-3 text-left w-36">Category</th>
                    <th className="px-4 py-3 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((product, index) => (
                    <tr
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="hover:bg-indigo-50 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono">{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductThumb src={product.image} title={product.title} />
                          <span className="font-medium text-gray-800 line-clamp-1 max-w-xs">
                            {product.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {product.stock === 0 ? (
                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">Out of Stock</span>
                        ) : product.stock <= 5 ? (
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">Low: {product.stock}</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">{product.stock} units</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-md transition font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1 rounded-md transition font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md transition font-medium disabled:opacity-50"
                          >
                            {deletingId === product.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >«</button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >‹</button>

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
                        page === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >{p}</button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >›</button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >»</button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}

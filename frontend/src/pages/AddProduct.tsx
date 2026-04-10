import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { createProduct } from '../services/api'
import type { NewProductPayload } from '../types'
import Navbar from '../components/Navbar'

export default function AddProduct() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [serverError, setServerError] = useState('')
  const [imgError, setImgError] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<NewProductPayload>()

  const imageUrl = useWatch({ control, name: 'image', defaultValue: '' })
  const previewSrc = activeTab === 'upload' ? uploadedImage : imageUrl

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setUploadedImage(base64)
      setValue('image', base64, { shouldValidate: true })
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: NewProductPayload) => {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await createProduct({ ...data, price: Number(data.price), stock: Number(data.stock) })
      console.log('[AddProduct] Product created with ID:', res.data.id)
      setSuccessMsg('Product added successfully! Redirecting...')
      reset()
      setUploadedImage('')
      setTimeout(() => navigate('/products'), 1800)
    } catch {
      console.error('[AddProduct] Failed to create product')
      setServerError('Failed to add product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1 text-indigo-600 hover:underline text-sm mb-6"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Add New Product</h2>
          <p className="text-gray-500 text-sm mb-6">Fill in the details below to create a product.</p>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {successMsg}
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="e.g. Wireless Headphones"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="e.g. 29.99"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' },
                })}
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.stock ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="e.g. 50"
                {...register('stock', {
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                })}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="jewelery">Jewelery</option>
                <option value="men's clothing">Men's Clothing</option>
                <option value="women's clothing">Women's Clothing</option>
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Describe the product..."
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>

              {/* Tab switcher */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('url'); setImgError(false) }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium border transition ${activeTab === 'url' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium border transition ${activeTab === 'upload' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload File
                </button>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  {activeTab === 'url' ? (
                    <>
                      <input
                        type="url"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.image ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="https://example.com/image.jpg"
                        {...register('image', {
                          required: 'Image is required',
                          onChange: () => setImgError(false),
                        })}
                      />
                      <p className="mt-1 text-xs text-gray-400">Paste a direct image URL</p>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition flex flex-col items-center justify-center gap-2"
                      >
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          {uploadedImage ? 'Image uploaded — click to change' : 'Click to upload an image'}
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP supported</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {/* hidden field keeps react-hook-form happy */}
                      <input type="hidden" {...register('image', { required: 'Image is required' })} />
                    </>
                  )}
                  {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image.message}</p>}
                </div>

                {/* Live preview */}
                <div className="w-24 h-24 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {previewSrc && !imgError ? (
                    <img
                      src={previewSrc}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-1">
                      {imgError ? 'Cannot load' : 'Preview'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {submitting ? 'Saving...' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

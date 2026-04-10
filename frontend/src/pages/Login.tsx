import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { loginUser, employeeLoginUser } from '../services/api'
import type { LoginCredentials } from '../types'

const bgImages = [
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1588058365548-9ded1f8b6e27?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1548549557-dbe9946621da?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop",
]

interface EmployeeForm extends LoginCredentials {
  employeeId: string
}

export default function Login() {
  const { login, isAuthenticated, isInitialized, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState<'customer' | 'employee'>('customer')

  // Already logged in — redirect to their home page
  if (isInitialized && isAuthenticated) {
    return <Navigate to={role === 'employee' ? '/products' : '/shop'} replace />
  }
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const justRegistered = (location.state as { registered?: boolean })?.registered

  // Customer form
  const {
    register: regCustomer,
    handleSubmit: handleCustomer,
    formState: { errors: errCustomer },
  } = useForm<LoginCredentials>()

  // Employee form
  const {
    register: regEmployee,
    handleSubmit: handleEmployee,
    formState: { errors: errEmployee },
  } = useForm<EmployeeForm>()

  const onCustomerSubmit = async (data: LoginCredentials) => {
    setServerError('')
    setLoading(true)
    try {
      const res = await loginUser(data)
      const result = login(res.data.token, res.data.role)
      if (result === 'conflict') {
        setServerError('You already have an active Employee session open in another tab. Please logout from that tab first before logging in as a Customer.')
        return
      }
      navigate('/shop')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setServerError(msg || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const onEmployeeSubmit = async (data: EmployeeForm) => {
    setServerError('')
    setLoading(true)
    try {
      const res = await employeeLoginUser(data)
      const result = login(res.data.token, res.data.role)
      if (result === 'conflict') {
        setServerError('You already have an active Customer session open in another tab. Please logout from that tab first before logging in as an Employee.')
        return
      }
      navigate('/products')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setServerError(msg || 'Invalid employee credentials.')
    } finally {
      setLoading(false)
    }
  }

  const EyeToggle = () => (
    <button type="button" onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {showPassword ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background mosaic */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
        {bgImages.map((src, i) => (
          <div key={i} className="overflow-hidden">
            <img src={src} alt="" className="w-full h-full object-cover scale-110" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-3">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">ShopDesk</h1>
          <p className="text-gray-300 text-sm mt-0.5">Your product management dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2">
            <button
              onClick={() => { setTab('customer'); setServerError('') }}
              className={`py-4 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
                tab === 'customer'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Customer Login
            </button>
            <button
              onClick={() => { setTab('employee'); setServerError('') }}
              className={`py-4 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
                tab === 'employee'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Employee Login
            </button>
          </div>

          <div className="px-8 py-7">
            {justRegistered && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Account created! You can now sign in.
              </div>
            )}

            {/* ── CUSTOMER FORM ── */}
            {tab === 'customer' && (
              <>
                <p className="text-gray-500 text-sm mb-5">Browse and shop our products.</p>
                <form onSubmit={handleCustomer(onCustomerSubmit)} noValidate className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition ${errCustomer.username ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Enter your username"
                        {...regCustomer('username', { required: 'Username is required' })}
                      />
                    </div>
                    {errCustomer.username && <p className="mt-1 text-xs text-red-500">{errCustomer.username.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input type={showPassword ? 'text' : 'password'}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition ${errCustomer.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Enter your password"
                        {...regCustomer('password', { required: 'Password is required' })}
                      />
                      <EyeToggle />
                    </div>
                    {errCustomer.password && <p className="mt-1 text-xs text-red-500">{errCustomer.password.message}</p>}
                  </div>

                  {serverError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {serverError}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                    {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in...</>) : 'Sign In as Customer'}
                  </button>
                </form>
              </>
            )}

            {/* ── EMPLOYEE FORM ── */}
            {tab === 'employee' && (
              <>
                <p className="text-gray-500 text-sm mb-5">Enter your credentials and Employee ID to access the dashboard.</p>
                <form onSubmit={handleEmployee(onEmployeeSubmit)} noValidate className="space-y-4">

                  {/* Employee ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                        </svg>
                      </span>
                      <input type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition ${errEmployee.employeeId ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="e.g. EMP001"
                        {...regEmployee('employeeId', { required: 'Employee ID is required' })}
                      />
                    </div>
                    {errEmployee.employeeId && <p className="mt-1 text-xs text-red-500">{errEmployee.employeeId.message}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition ${errEmployee.username ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Enter your username"
                        {...regEmployee('username', { required: 'Username is required' })}
                      />
                    </div>
                    {errEmployee.username && <p className="mt-1 text-xs text-red-500">{errEmployee.username.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input type={showPassword ? 'text' : 'password'}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition ${errEmployee.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
                        placeholder="Enter your password"
                        {...regEmployee('password', { required: 'Password is required' })}
                      />
                      <EyeToggle />
                    </div>
                    {errEmployee.password && <p className="mt-1 text-xs text-red-500">{errEmployee.password.message}</p>}
                  </div>

                  {serverError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {serverError}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm">
                    {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in...</>) : 'Sign In as Employee'}
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-gray-400 mt-5">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

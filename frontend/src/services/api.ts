import axios from 'axios'
import type { AuthResponse, LoginCredentials, NewProductPayload, Product, SignupPayload, SignupResponse, UserProfile } from '../types'

// Single axios instance pointing at our custom backend
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Log every outgoing request and attach the JWT if we have one
api.interceptors.request.use((config) => {
  // Read active role from sessionStorage, then get the matching token from localStorage
  const activeRole = sessionStorage.getItem('active_role')
  const tokenKey = activeRole === 'employee' ? 'emp_token' : 'cust_token'
  const token = activeRole ? localStorage.getItem(tokenKey) : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url} — sending with auth token`)
  } else {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url} — no token attached`)
  }
  return config
})

// Log every response; handle 401 by clearing session and redirecting
api.interceptors.response.use(
  (res) => {
    console.log(`[API] ✅ ${res.status} ${res.config.url}`)
    return res
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    console.error(`[API] ❌ ${status} ${url} — ${error.message}`)
    if (status === 401) {
      console.warn('[Auth] Session expired or invalid — clearing token and redirecting to login')
      const _role = sessionStorage.getItem('active_role')
      if (_role === 'employee') localStorage.removeItem('emp_token')
      else localStorage.removeItem('cust_token')
      sessionStorage.removeItem('active_role')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// --- Auth ---
export const loginUser = (credentials: LoginCredentials) => {
  console.log(`[Auth] Attempting customer login for user: "${credentials.username}"`)
  return api.post<AuthResponse>('/auth/login', credentials)
}

export const employeeLoginUser = (credentials: LoginCredentials & { employeeId: string }) => {
  console.log(`[Auth] Attempting employee login for user: "${credentials.username}"`)
  return api.post<AuthResponse>('/auth/employee-login', credentials)
}

export const signupUser = (payload: SignupPayload) => {
  console.log(`[Auth] Registering new user: "${payload.username}"`)
  return api.post<SignupResponse>('/users', payload)
}

// --- Users ---
export const fetchCurrentUser = () => {
  console.log('[Users] Fetching current user profile...')
  return api.get<UserProfile>('/users/me')
}

export const changePassword = (currentPassword: string, newPassword: string) => {
  console.log('[Auth] Attempting password change...')
  return api.put('/users/change-password', { currentPassword, newPassword })
}

// --- Products ---
export const fetchProducts = () => {
  console.log('[Products] Fetching all products...')
  return api.get<Product[]>('/products')
}

export const fetchProductById = (id: number) => {
  console.log(`[Products] Fetching product with ID: ${id}`)
  return api.get<Product>(`/products/${id}`)
}

export const createProduct = (payload: NewProductPayload) => {
  console.log('[Products] Creating new product:', payload.title)
  return api.post<Product>('/products', payload)
}

// PUT /products/{id} — full payload required as per API spec
export const updateProduct = (id: number, payload: NewProductPayload) => {
  console.log(`[Products] Updating product ID ${id}:`, payload.title)
  return api.put<Product>(`/products/${id}`, { ...payload, id })
}

// DELETE /products/{id} — id is a path parameter, no request body needed
export const deleteProduct = (id: number) => {
  console.log(`[Products] Deleting product with ID: ${id}`)
  return api.delete<Product>(`/products/${id}`)
}

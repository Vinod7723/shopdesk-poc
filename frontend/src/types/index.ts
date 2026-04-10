// Shape of each product
export interface Product {
  id: number
  title: string
  price: number
  stock: number
  description: string
  category: string
  image: string
  rating?: {
    rate: number
    count: number
  }
}

// What we send when creating or updating a product
export interface NewProductPayload {
  id?: number
  title: string
  price: number
  stock: number
  description: string
  category: string
  image: string
}

// Login credentials
export interface LoginCredentials {
  username: string
  password: string
}

// Response from the auth endpoint — includes role so frontend can route accordingly
export interface AuthResponse {
  token: string
  role: 'employee' | 'customer'
}

// Payload for creating a new user via POST /users
export interface SignupPayload {
  email: string
  username: string
  password: string
  name: {
    firstname: string
    lastname: string
  }
  phone: string
  role: 'employee' | 'customer'
}

// Response after a successful signup (API returns the new user id)
export interface SignupResponse {
  id: number
}

// Logged-in user's profile returned from GET /users/me
export interface UserProfile {
  id: number
  username: string
  email: string
  role: 'employee' | 'customer'
  name: { firstname: string; lastname: string }
  phone?: string
  employeeId?: string
}

// A single item in the shopping cart
export interface CartItem {
  product: Product
  quantity: number
}

// A completed order saved to localStorage
export interface OrderItem {
  productId: number
  title: string
  image: string
  category: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  placedAt: string        // ISO date string
  items: OrderItem[]
  total: number
  shipping: {
    fullName: string
    address: string
    city: string
    zip: string
    country: string
  }
}

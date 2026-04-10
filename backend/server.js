const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001
const JWT_SECRET = 'poc-secret-key-2024'
const DB_PATH = path.join(__dirname, 'db.json')

app.use(cors())
app.use(express.json())

// Helper — read the db.json file
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

// Helper — write back to db.json
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// Middleware — verify JWT token on protected routes
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// POST /auth/login — customer login only
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const db = readDB()
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  )

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  // Block employees from using the customer login
  if (user.role === 'employee') {
    return res.status(403).json({ message: 'Please use the Employee Login with your Employee ID' })
  }

  const role = user.role || 'customer'
  const token = jwt.sign({ id: user.id, username: user.username, role }, JWT_SECRET, { expiresIn: '24h' })
  console.log(`[Auth] Customer login: "${username}"`)
  res.json({ token, role })
})

// POST /auth/employee-login — employee login (requires employeeId)
app.post('/auth/employee-login', (req, res) => {
  const { username, password, employeeId } = req.body
  if (!username || !password || !employeeId) {
    return res.status(400).json({ message: 'Username, password and Employee ID are required' })
  }

  const db = readDB()
  const user = db.users.find(
    (u) => u.username === username && u.password === password && u.role === 'employee'
  )

  if (!user) {
    return res.status(401).json({ message: 'Invalid employee credentials' })
  }

  if (user.employeeId !== employeeId) {
    return res.status(401).json({ message: 'Invalid Employee ID' })
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: 'employee' }, JWT_SECRET, { expiresIn: '24h' })
  console.log(`[Auth] Employee login: "${username}" (${employeeId})`)
  res.json({ token, role: 'employee' })
})

// ─────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────

// POST /users — register a new user
app.post('/users', (req, res) => {
  const { email, username, password, name, phone } = req.body
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'email, username and password are required' })
  }

  const db = readDB()
  const exists = db.users.find((u) => u.username === username)
  if (exists) {
    return res.status(400).json({ message: 'Username already taken' })
  }

  const newUser = {
    id: Date.now(),
    username,
    password,
    email,
    role: req.body.role || 'customer',
    name: name || { firstname: '', lastname: '' },
    phone: phone || '',
  }

  db.users.push(newUser)
  writeDB(db)

  console.log(`[Users] New user registered: "${username}"`)
  res.status(201).json({ id: newUser.id })
})

// GET /users/me — return current user's profile (no password)
app.get('/users/me', authenticate, (req, res) => {
  const db = readDB()
  const user = db.users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { password: _pw, ...safeUser } = user
  res.json(safeUser)
})

// PUT /users/change-password — change password for logged-in user
app.put('/users/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required' })
  }

  const db = readDB()
  const index = db.users.findIndex((u) => u.id === req.user.id)
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' })
  }

  if (db.users[index].password !== currentPassword) {
    return res.status(401).json({ message: 'Current password is incorrect' })
  }

  db.users[index].password = newPassword
  writeDB(db)

  console.log(`[Users] Password changed for user: "${db.users[index].username}"`)
  res.json({ message: 'Password updated successfully' })
})

// ─────────────────────────────────────────────
// PRODUCT ROUTES — all protected
// ─────────────────────────────────────────────

// GET /products — fetch all products
app.get('/products', authenticate, (_req, res) => {
  const db = readDB()
  console.log(`[Products] GET all — returning ${db.products.length} products`)
  res.json(db.products)
})

// GET /products/:id — fetch single product
app.get('/products/:id', authenticate, (req, res) => {
  const db = readDB()
  const product = db.products.find((p) => p.id === Number(req.params.id))
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }
  console.log(`[Products] GET id=${req.params.id} — "${product.title}"`)
  res.json(product)
})

// POST /products — create new product
app.post('/products', authenticate, (req, res) => {
  const { title, price, description, category, image } = req.body
  if (!title || !price || !description || !category || !image) {
    return res.status(400).json({ message: 'All fields are required: title, price, description, category, image' })
  }

  const db = readDB()
  const { stock } = req.body
  const newProduct = {
    id: Date.now(),
    title,
    price: Number(price),
    stock: stock !== undefined ? Number(stock) : 0,
    description,
    category,
    image,
  }

  db.products.push(newProduct)
  writeDB(db)

  console.log(`[Products] POST — created "${title}" with id=${newProduct.id}`)
  res.status(201).json(newProduct)
})

// PUT /products/:id — update existing product
app.put('/products/:id', authenticate, (req, res) => {
  const db = readDB()
  const index = db.products.findIndex((p) => p.id === Number(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const { title, price, stock, description, category, image } = req.body
  db.products[index] = {
    ...db.products[index],
    title: title ?? db.products[index].title,
    price: price !== undefined ? Number(price) : db.products[index].price,
    stock: stock !== undefined ? Number(stock) : db.products[index].stock,
    description: description ?? db.products[index].description,
    category: category ?? db.products[index].category,
    image: image ?? db.products[index].image,
  }

  writeDB(db)
  console.log(`[Products] PUT id=${req.params.id} — updated "${db.products[index].title}"`)
  res.json(db.products[index])
})

// DELETE /products/:id — delete product
app.delete('/products/:id', authenticate, (req, res) => {
  const db = readDB()
  const index = db.products.findIndex((p) => p.id === Number(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const deleted = db.products[index]
  db.products.splice(index, 1)
  writeDB(db)

  console.log(`[Products] DELETE id=${req.params.id} — removed "${deleted.title}"`)
  res.json(deleted)
})

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(``)
  console.log(`  Custom API Server running at http://localhost:${PORT}`)
  console.log(``)
  console.log(`  Endpoints:`)
  console.log(`  POST   /auth/login       — login`)
  console.log(`  POST   /users            — register`)
  console.log(`  GET    /products         — list all`)
  console.log(`  GET    /products/:id     — get one`)
  console.log(`  POST   /products         — create`)
  console.log(`  PUT    /products/:id     — update`)
  console.log(`  DELETE /products/:id     — delete`)
  console.log(``)
})

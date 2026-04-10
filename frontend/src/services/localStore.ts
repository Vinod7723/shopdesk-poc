import type { Product } from '../types'

// Keys used in localStorage
const DELETED_IDS_KEY = 'poc_deleted_ids'
const ADDED_PRODUCTS_KEY = 'poc_added_products'

// Returns the list of product IDs the user has deleted
export function getDeletedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || '[]')
  } catch {
    return []
  }
}

// Saves a deleted product ID so it stays removed after refresh
export function saveDeletedId(id: number): void {
  const ids = getDeletedIds()
  if (!ids.includes(id)) {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...ids, id]))
    console.log(`[LocalStore] Saved deleted ID ${id} — total deleted: ${ids.length + 1}`)
  }
}

// Returns products the user added locally
export function getAddedProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(ADDED_PRODUCTS_KEY) || '[]')
  } catch {
    return []
  }
}

// Saves a newly added product locally with a unique temp ID
export function saveAddedProduct(product: Omit<Product, 'id'>): Product {
  const existing = getAddedProducts()
  // Use a high temp ID (100000+) to avoid clashing with real API IDs (1–20)
  const tempId = Date.now()
  const newProduct: Product = { ...product, id: tempId }
  localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify([...existing, newProduct]))
  console.log(`[LocalStore] Saved new product locally with temp ID: ${tempId}`)
  return newProduct
}

// Removes a locally added product (used when deleting a user-added product)
export function removeAddedProduct(id: number): void {
  const existing = getAddedProducts()
  localStorage.setItem(ADDED_PRODUCTS_KEY, JSON.stringify(existing.filter((p) => p.id !== id)))
}

// --- Edited products ---
const EDITED_PRODUCTS_KEY = 'poc_edited_products'

// Returns a map of id → edited product data
export function getEditedProducts(): Record<number, Product> {
  try {
    return JSON.parse(localStorage.getItem(EDITED_PRODUCTS_KEY) || '{}')
  } catch {
    return {}
  }
}

// Saves the edited version of a product so it survives a refresh
export function saveEditedProduct(product: Product): void {
  const existing = getEditedProducts()
  existing[product.id] = product
  localStorage.setItem(EDITED_PRODUCTS_KEY, JSON.stringify(existing))
  console.log(`[LocalStore] Saved edited product ID ${product.id}: "${product.title}"`)
}

// Returns the edited version of a product if one exists, otherwise null
export function getEditedProduct(id: number): Product | null {
  const edits = getEditedProducts()
  return edits[id] ?? null
}

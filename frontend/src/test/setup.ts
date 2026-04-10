import '@testing-library/jest-dom'

// Vitest 4.x + jsdom does not always expose the full Storage API (clear, key, length).
// Provide complete in-memory stubs so every test can call localStorage.clear() etc.
const makeStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem:    (k: string) => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = String(v) },
    removeItem: (k: string) => { delete store[k] },
    clear:      () => { Object.keys(store).forEach(k => delete store[k]) },
    get length() { return Object.keys(store).length },
    key:        (i: number) => Object.keys(store)[i] ?? null,
  }
}

Object.defineProperty(globalThis, 'localStorage',   { value: makeStorage(), writable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: makeStorage(), writable: true })

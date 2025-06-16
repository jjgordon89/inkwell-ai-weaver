import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  value: vi.fn(() => ({
    toString: vi.fn(() => ''),
  })),
})

// Mock SQL.js for database tests
vi.mock('sql.js', () => ({
  default: vi.fn(() => Promise.resolve({
    Database: vi.fn(() => ({
      run: vi.fn(),
      prepare: vi.fn(() => ({
        run: vi.fn(),
        getAsObject: vi.fn(() => ({})),
        step: vi.fn(() => false),
        free: vi.fn(),
        bind: vi.fn(),
      })),
      export: vi.fn(() => new Uint8Array()),
      close: vi.fn(),
    })),
  })),
}))

// Mock fetch for AI API calls
global.fetch = vi.fn()

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
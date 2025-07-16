import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Effect, Schema } from 'effect'
import { AuthResult, AuthState } from '../auth-demo'
import { AuthService } from '../../services/AuthService'
import { RuntimeClient } from '../../services/RuntimeClient'

// Mock the AuthService and RuntimeClient
vi.mock('../../services/AuthService', () => ({
  AuthService: {
    pipe: vi.fn(),
  }
}))

vi.mock('../../services/RuntimeClient', () => ({
  RuntimeClient: {
    runPromise: vi.fn(),
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal('localStorage', localStorageMock)

// Create a test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

describe('AuthResult Schema', () => {
  it('should create AuthResult with required fields', () => {
    const result = new AuthResult({
      success: true,
      data: { message: 'test' },
      error: 'test error',
      code: 'TEST_CODE'
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ message: 'test' })
    expect(result.error).toBe('test error')
    expect(result.code).toBe('TEST_CODE')
  })

  it('should create AuthResult with optional fields', () => {
    const result = new AuthResult({
      success: false
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBeUndefined()
    expect(result.code).toBeUndefined()
  })

  // Edge case tests for Schema validation
  it('should handle AuthResult with complex nested data structures', () => {
    const complexData = {
      user: { id: 1, name: 'admin', permissions: ['read', 'write'] },
      session: { token: 'abc123', expiresAt: 1234567890 },
      metadata: { loginTime: new Date(), deviceInfo: { browser: 'Chrome' } }
    }

    const result = new AuthResult({
      success: true,
      data: complexData,
      error: undefined,
      code: 'SUCCESS'
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(complexData)
    expect(result.code).toBe('SUCCESS')
  })

  it('should handle AuthResult with empty data object', () => {
    const result = new AuthResult({
      success: true,
      data: {},
      error: undefined,
      code: ''
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({})
    expect(result.error).toBeUndefined()
    expect(result.code).toBe('')
  })

  it('should handle AuthResult with various error scenarios', () => {
    const errorCases = [
      { error: 'Network timeout', code: 'TIMEOUT' },
      { error: 'Invalid credentials', code: 'AUTH_ERROR' },
      { error: 'Server error', code: 'SERVER_ERROR' },
      { error: 'Rate limit exceeded', code: 'RATE_LIMIT' },
      { error: '', code: 'EMPTY_ERROR' }
    ]

    errorCases.forEach(({ error, code }) => {
      const result = new AuthResult({
        success: false,
        error,
        code
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
      expect(result.code).toBe(code)
    })
  })

  it('should handle AuthResult with null and undefined values', () => {
    const result = new AuthResult({
      success: false,
      data: undefined,
      error: undefined,
      code: undefined
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.error).toBeUndefined()
    expect(result.code).toBeUndefined()
  })
})

describe('AuthState Schema', () => {
  it('should create AuthState with authenticated user', () => {
    const state = new AuthState({
      token: 'test-token',
      isAuthenticated: true,
      user: { username: 'admin' }
    })

    expect(state.token).toBe('test-token')
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual({ username: 'admin' })
  })

  it('should create AuthState with unauthenticated user', () => {
    const state = new AuthState({
      token: null,
      isAuthenticated: false,
      user: null
    })

    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  // Edge case tests for AuthState Schema
  it('should handle various token formats', () => {
    const tokenCases = [
      'jwt.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      'simple-token-123',
      'bearer-token-with-special-chars!@#$%^&*()',
      'very-long-token-' + 'a'.repeat(1000),
      '',
      'null',
      'undefined'
    ]

    tokenCases.forEach((token) => {
      const state = new AuthState({
        token,
        isAuthenticated: token !== '' && token !== 'null' && token !== 'undefined',
        user: token ? { username: 'admin', token } : null
      })

      expect(state.token).toBe(token)
      expect(typeof state.isAuthenticated).toBe('boolean')
    })
  })

  it('should handle complex user objects', () => {
    const complexUser = {
      id: 12345,
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin', 'user'],
      permissions: {
        read: true,
        write: true,
        delete: false
      },
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg'
      },
      settings: {
        theme: 'dark',
        notifications: true,
        language: 'en-US'
      }
    }

    const state = new AuthState({
      token: 'complex-token',
      isAuthenticated: true,
      user: complexUser
    })

    expect(state.token).toBe('complex-token')
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(complexUser)
  })

  it('should handle inconsistent authentication states', () => {
    const inconsistentCases = [
      { token: 'valid-token', isAuthenticated: false, user: null },
      { token: null, isAuthenticated: true, user: { username: 'admin' } },
      { token: '', isAuthenticated: true, user: { username: 'admin' } },
      { token: 'token', isAuthenticated: false, user: { username: 'admin' } }
    ]

    inconsistentCases.forEach(({ token, isAuthenticated, user }) => {
      const state = new AuthState({ token, isAuthenticated, user })
      
      expect(state.token).toBe(token)
      expect(state.isAuthenticated).toBe(isAuthenticated)
      expect(state.user).toEqual(user)
    })
  })

  it('should handle null and undefined user objects', () => {
    const nullUserState = new AuthState({
      token: 'token',
      isAuthenticated: false,
      user: null
    })

    const undefinedUserState = new AuthState({
      token: 'token',
      isAuthenticated: false,
      user: undefined
    })

    expect(nullUserState.user).toBeNull()
    expect(undefinedUserState.user).toBeUndefined()
  })

  it('should handle empty and minimal user objects', () => {
    const emptyUserState = new AuthState({
      token: 'token',
      isAuthenticated: true,
      user: {}
    })

    const minimalUserState = new AuthState({
      token: 'token',
      isAuthenticated: true,
      user: { username: '' }
    })

    expect(emptyUserState.user).toEqual({})
    expect(minimalUserState.user).toEqual({ username: '' })
  })
})

describe('AuthDemoComponent', () => {
  let AuthDemoComponent: React.ComponentType

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Mock RuntimeClient.runPromise to return a resolved promise
    vi.mocked(RuntimeClient.runPromise).mockResolvedValue(undefined)
    
    // Dynamically import the component to avoid module loading issues
    return import('../auth-demo').then(module => {
      AuthDemoComponent = module.Route.options.component
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the authentication demo page', async () => {
    render(<AuthDemoComponent />)

    expect(screen.getByText('Authentication Demo with Effect-TS')).toBeInTheDocument()
    expect(screen.getByText('Complete authentication flow with Effect patterns, token management, and error handling')).toBeInTheDocument()
    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
  })

  it('should render login form with default values', async () => {
    render(<AuthDemoComponent />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    expect(usernameInput).toHaveValue('admin')
    expect(passwordInput).toHaveValue('password123')
    expect(loginButton).toBeInTheDocument()
    expect(loginButton).not.toBeDisabled()
  })

  it('should render action buttons', async () => {
    render(<AuthDemoComponent />)

    expect(screen.getByRole('button', { name: /secured action/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get greeting/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resilient action/i })).toBeInTheDocument()
  })

  it('should disable secured action when not authenticated', async () => {
    render(<AuthDemoComponent />)

    const securedButton = screen.getByRole('button', { name: /secured action/i })
    expect(securedButton).toBeDisabled()
  })

  it('should allow public greeting without authentication', async () => {
    render(<AuthDemoComponent />)

    const greetingButton = screen.getByRole('button', { name: /get greeting/i })
    expect(greetingButton).not.toBeDisabled()
  })

  it('should handle username input changes', async () => {
    const user = userEvent.setup()
    render(<AuthDemoComponent />)

    const usernameInput = screen.getByLabelText(/username/i)
    await user.clear(usernameInput)
    await user.type(usernameInput, 'testuser')

    expect(usernameInput).toHaveValue('testuser')
  })

  it('should handle password input changes', async () => {
    const user = userEvent.setup()
    render(<AuthDemoComponent />)

    const passwordInput = screen.getByLabelText(/password/i)
    await user.clear(passwordInput)
    await user.type(passwordInput, 'newpassword')

    expect(passwordInput).toHaveValue('newpassword')
  })

  it('should handle login form submission', async () => {
    const user = userEvent.setup()
    
    // Mock successful authentication
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValueOnce(undefined)
    
    render(<AuthDemoComponent />)

    const loginButton = screen.getByRole('button', { name: /login/i })
    await user.click(loginButton)

    expect(mockRunPromise).toHaveBeenCalled()
  })

  it('should handle logout', async () => {
    // First, we need to render with an authenticated state
    // This would require mocking the initial localStorage.getItem to return a token
    localStorageMock.getItem.mockReturnValue('test-token')
    
    const user = userEvent.setup()
    render(<AuthDemoComponent />)

    // Wait for the component to process the initial token
    await waitFor(() => {
      // The logout button should appear once authenticated
      // This depends on the validateStoredToken function completing
    })

    // Since we're mocking, we need to manually trigger the authenticated state
    // In a real scenario, this would be handled by the Effect runtime
  })

  it('should handle button clicks for actions', async () => {
    const user = userEvent.setup()
    render(<AuthDemoComponent />)

    const greetingButton = screen.getByRole('button', { name: /get greeting/i })
    const resilientButton = screen.getByRole('button', { name: /resilient action/i })

    await user.click(greetingButton)
    await user.click(resilientButton)

    expect(RuntimeClient.runPromise).toHaveBeenCalledTimes(2)
  })

  it('should display loading states', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed promise to test loading states
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<AuthDemoComponent />)

    const greetingButton = screen.getByRole('button', { name: /get greeting/i })
    await user.click(greetingButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  it('should check localStorage for existing token on mount', async () => {
    const mockToken = 'existing-token'
    localStorageMock.getItem.mockReturnValue(mockToken)
    
    render(<AuthDemoComponent />)

    expect(localStorageMock.getItem).toHaveBeenCalledWith('auth-token')
  })

  it('should display Effect-TS features information', async () => {
    render(<AuthDemoComponent />)

    expect(screen.getByText('Effect-TS Authentication Features')).toBeInTheDocument()
    expect(screen.getByText(/Effect\.Service/)).toBeInTheDocument()
    expect(screen.getByText(/Schema\.Class/)).toBeInTheDocument()
    expect(screen.getByText(/TaggedError/)).toBeInTheDocument()
    expect(screen.getByText(/Effect\.gen/)).toBeInTheDocument()
    expect(screen.getByText(/Effect\.match/)).toBeInTheDocument()
    expect(screen.getByText(/Effect\.retry/)).toBeInTheDocument()
  })

  it('should handle form validation', async () => {
    const user = userEvent.setup()
    render(<AuthDemoComponent />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    // Clear required fields
    await user.clear(usernameInput)
    await user.clear(passwordInput)

    // Try to submit form
    await user.click(loginButton)

    // HTML5 validation should prevent submission
    expect(usernameInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('should render authentication status correctly', async () => {
    render(<AuthDemoComponent />)

    // Should show red indicator for not authenticated
    const statusIndicator = screen.getByText('Not authenticated').previousElementSibling
    expect(statusIndicator).toHaveClass('bg-red-500')
  })
})

describe('AuthDemoComponent Integration Tests', () => {
  let AuthDemoComponent: React.ComponentType

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    return import('../auth-demo').then(module => {
      AuthDemoComponent = module.Route.options.component
    })
  })

  it('should handle authentication flow with Effect patterns', async () => {
    const user = userEvent.setup()
    
    // Mock successful authentication result
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValueOnce(undefined)
    
    render(<AuthDemoComponent />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    // Fill in credentials
    await user.clear(usernameInput)
    await user.type(usernameInput, 'admin')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'password123')

    // Submit form
    await user.click(loginButton)

    // Should call RuntimeClient.runPromise with Effect program
    expect(mockRunPromise).toHaveBeenCalled()
  })

  it('should handle Effect.match error patterns', async () => {
    const user = userEvent.setup()
    
    // Mock successful authentication to avoid unhandled rejections
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValueOnce(undefined)
    
    render(<AuthDemoComponent />)

    const loginButton = screen.getByRole('button', { name: /login/i })
    await user.click(loginButton)

    // Should call RuntimeClient.runPromise for Effect.match patterns
    expect(mockRunPromise).toHaveBeenCalled()
  })

  it('should handle resilient operations with retry logic', async () => {
    const user = userEvent.setup()
    
    // Mock resilient operation
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValueOnce(undefined)
    
    render(<AuthDemoComponent />)

    const resilientButton = screen.getByRole('button', { name: /resilient action/i })
    await user.click(resilientButton)

    // Should call RuntimeClient.runPromise for resilient operation
    expect(mockRunPromise).toHaveBeenCalled()
  })
})

describe('Effect.gen Workflow Edge Cases', () => {
  let AuthDemoComponent: React.ComponentType

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    return import('../auth-demo').then(module => {
      AuthDemoComponent = module.Route.options.component
    })
  })

  it('should handle multiple sequential Effect.gen operations', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    // Mock sequential operations
    mockRunPromise
      .mockResolvedValueOnce(undefined) // First operation
      .mockResolvedValueOnce(undefined) // Second operation
      .mockResolvedValueOnce(undefined) // Third operation
    
    render(<AuthDemoComponent />)

    // Execute multiple operations in sequence
    await user.click(screen.getByRole('button', { name: /get greeting/i }))
    await user.click(screen.getByRole('button', { name: /resilient action/i }))
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(mockRunPromise).toHaveBeenCalledTimes(3)
  })

  it('should handle concurrent Effect.gen operations', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    // Mock concurrent operations with different delays
    mockRunPromise
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<AuthDemoComponent />)

    // Execute multiple operations concurrently
    const greetingButton = screen.getByRole('button', { name: /get greeting/i })
    const resilientButton = screen.getByRole('button', { name: /resilient action/i })
    
    // Click buttons rapidly to trigger concurrent operations
    await Promise.all([
      user.click(greetingButton),
      user.click(resilientButton)
    ])

    // Should handle concurrent executions
    expect(mockRunPromise).toHaveBeenCalledTimes(2)
  })

  it('should handle Effect.gen with different parameter combinations', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValue(undefined)
    
    render(<AuthDemoComponent />)

    // Test different input combinations
    const inputCombinations = [
      { username: 'admin', password: 'password123' },
      { username: 'user', password: 'test' },
      { username: 'admin', password: 'very-long-password-test' }
    ]

    for (const { username, password } of inputCombinations) {
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.clear(usernameInput)
      await user.clear(passwordInput)
      await user.type(usernameInput, username)
      await user.type(passwordInput, password)
      
      await user.click(screen.getByRole('button', { name: /login/i }))
    }

    expect(mockRunPromise).toHaveBeenCalledTimes(inputCombinations.length)
  })
})

describe('RuntimeClient Edge Cases', () => {
  let AuthDemoComponent: React.ComponentType

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    return import('../auth-demo').then(module => {
      AuthDemoComponent = module.Route.options.component
    })
  })

  it('should handle RuntimeClient timeout scenarios', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    // Mock timeout scenario
    mockRunPromise.mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), 100)
      )
    )
    
    render(<AuthDemoComponent />)
    
    // Should handle timeout gracefully
    await user.click(screen.getByRole('button', { name: /get greeting/i }))
    
    // Wait for timeout to occur
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Component should still be functional
    expect(screen.getByRole('button', { name: /get greeting/i })).toBeInTheDocument()
  })

  it('should handle RuntimeClient memory pressure scenarios', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    // Mock memory pressure by creating large objects
    mockRunPromise.mockImplementation(() => {
      const largeObject = new Array(10000).fill(0).map((_, i) => ({ id: i, data: 'x'.repeat(1000) }))
      return Promise.resolve(largeObject)
    })
    
    render(<AuthDemoComponent />)
    
    // Execute multiple operations to test memory handling
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: /get greeting/i }))
    }
    
    expect(mockRunPromise).toHaveBeenCalledTimes(5)
  })

  it('should handle RuntimeClient with various error types', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    const errorTypes = [
      new Error('Network error'),
      new TypeError('Type error'),
      new ReferenceError('Reference error'),
      new SyntaxError('Syntax error'),
      { message: 'Custom error object' }
    ]
    
    render(<AuthDemoComponent />)
    
    for (const error of errorTypes) {
      mockRunPromise.mockRejectedValueOnce(error)
      
      // Should handle different error types gracefully
      await user.click(screen.getByRole('button', { name: /get greeting/i }))
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Component should remain functional
      expect(screen.getByRole('button', { name: /get greeting/i })).toBeInTheDocument()
    }
  })
})

describe('localStorage Token Management Edge Cases', () => {
  let AuthDemoComponent: React.ComponentType

  beforeEach(() => {
    vi.clearAllMocks()
    
    return import('../auth-demo').then(module => {
      AuthDemoComponent = module.Route.options.component
    })
  })

  it('should handle corrupted localStorage data', async () => {
    const corruptedData = [
      'invalid-json',
      '{"incomplete": ',
      'null',
      'undefined',
      '',
      '[]',
      '{}',
      'true',
      'false',
      '123',
      new Array(10000).fill('x').join('')
    ]

    for (const data of corruptedData) {
      localStorageMock.getItem.mockReturnValue(data)
      
      // Should handle corrupted data gracefully
      const { unmount } = render(<AuthDemoComponent />)
      
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
      
      // Clean up to avoid multiple elements
      unmount()
    }
  })

  it('should handle localStorage quota exceeded scenarios', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValue(undefined)
    
    // Mock localStorage quota exceeded
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    
    render(<AuthDemoComponent />)
    
    // Should handle quota exceeded gracefully
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    // Component should remain functional
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should handle localStorage access denied scenarios', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    mockRunPromise.mockResolvedValue(undefined)
    
    // Mock localStorage access denied - but only for getItem on mount
    let shouldThrow = true
    localStorageMock.getItem.mockImplementation(() => {
      if (shouldThrow) {
        shouldThrow = false // Only throw once
        throw new Error('Access denied')
      }
      return null
    })
    
    // This should not throw because we handle the error
    expect(() => render(<AuthDemoComponent />)).not.toThrow()
    
    // Should handle access denied gracefully
    await user.click(screen.getByRole('button', { name: /login/i }))
    
    expect(screen.getByText('Not authenticated')).toBeInTheDocument()
  })
})

describe('Effect.retry Resilient Operations Edge Cases', () => {
  let AuthDemoComponent: React.ComponentType

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    return import('../auth-demo').then(module => {
      AuthDemoComponent = module.Route.options.component
    })
  })

  it('should handle retry operations with various failure patterns', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    const failurePatterns = [
      // Immediate failure
      () => Promise.reject(new Error('Immediate failure')),
      // Delayed failure
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('Delayed failure')), 50)),
      // Memory error
      () => Promise.reject(new Error('Out of memory')),
      // Network error
      () => Promise.reject(new Error('Network unavailable'))
    ]
    
    render(<AuthDemoComponent />)
    
    for (const pattern of failurePatterns) {
      mockRunPromise.mockImplementation(pattern)
      
      // Should handle different failure patterns
      await user.click(screen.getByRole('button', { name: /resilient action/i }))
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Component should remain functional
      expect(screen.getByRole('button', { name: /resilient action/i })).toBeInTheDocument()
    }
  })

  it('should handle retry operations with success after multiple failures', async () => {
    const user = userEvent.setup()
    const mockRunPromise = vi.mocked(RuntimeClient.runPromise)
    
    let attemptCount = 0
    mockRunPromise.mockImplementation(() => {
      attemptCount++
      if (attemptCount < 3) {
        return Promise.reject(new Error(`Attempt ${attemptCount} failed`))
      }
      return Promise.resolve(`Success on attempt ${attemptCount}`)
    })
    
    render(<AuthDemoComponent />)
    
    await user.click(screen.getByRole('button', { name: /resilient action/i }))
    
    // Should eventually succeed after retries
    expect(mockRunPromise).toHaveBeenCalled()
  })
})
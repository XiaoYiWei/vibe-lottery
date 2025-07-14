import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Effect } from 'effect'
import { 
  AuthService, 
  LoginCredentials, 
  AuthToken, 
  UserSession, 
  SecuredActionResult, 
  GreetingResult,
  AuthenticationError,
  AuthorizationError,
  TokenError
} from '../AuthService'
import { RuntimeClient } from '../RuntimeClient'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authenticate', () => {
    it('should authenticate admin user successfully', async () => {
      const credentials = new LoginCredentials({
        username: 'admin',
        password: 'password123'
      })

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.authenticate(credentials)
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(AuthToken)
      expect(result.userId).toBe('admin')
      expect(result.token).toMatch(/.+/)
      expect(result.expiresAt).toBeTypeOf('number')
      expect(result.expiresAt).toBeGreaterThan(Date.now())
    })

    it('should fail with invalid username', async () => {
      const credentials = new LoginCredentials({
        username: 'invalid',
        password: 'password123'
      })

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.authenticate(credentials)
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow('Invalid username. Only "admin" is allowed.')
    })

    it('should fail with empty password', async () => {
      const credentials = new LoginCredentials({
        username: 'admin',
        password: ''
      })

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.authenticate(credentials)
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow('Password is required')
    })

    it('should handle authentication errors with Effect patterns', async () => {
      const credentials = new LoginCredentials({
        username: 'invalid',
        password: 'password123'
      })

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* Effect.match(authService.authenticate(credentials), {
          onFailure: (error) => {
            if (error._tag === 'AuthenticationError') {
              return { type: 'auth', message: error.message, code: error.code }
            }
            return { type: 'unknown', message: error.message }
          },
          onSuccess: (token) => ({ type: 'success', token })
        })
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toEqual({
        type: 'auth',
        message: 'Invalid username. Only "admin" is allowed.',
        code: 'INVALID_USERNAME'
      })
    })
  })

  describe('validateToken', () => {
    let validToken: string

    beforeEach(async () => {
      // Generate a valid token for tests
      const credentials = new LoginCredentials({
        username: 'admin',
        password: 'password123'
      })

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const authResult = yield* authService.authenticate(credentials)
        return authResult.token
      })

      validToken = await RuntimeClient.runPromise(program)
    })

    it('should validate valid token successfully', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.validateToken(validToken)
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(UserSession)
      expect(result.userId).toBe('admin')
      expect(result.username).toBe('admin')
      expect(result.isAuthenticated).toBe(true)
      expect(result.loginTime).toBeTypeOf('number')
    })

    it('should fail with empty token', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.validateToken('')
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow('Token is required')
    })

    it('should fail with invalid token format', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.validateToken('invalid-token')
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow()
    })
  })

  describe('performSecuredAction', () => {
    let validToken: string

    beforeEach(async () => {
      // Generate a valid token for tests
      const credentials = new LoginCredentials({
        username: 'admin',
        password: 'password123'
      })

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const authResult = yield* authService.authenticate(credentials)
        return authResult.token
      })

      validToken = await RuntimeClient.runPromise(program)
    })

    it('should perform secured action with valid token', async () => {
      const actionType = 'delete-user'

      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.performSecuredAction(validToken, actionType)
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(SecuredActionResult)
      expect(result.message).toBe('Secured action "delete-user" completed successfully')
      expect(result.userId).toBe('admin')
      expect(result.actionType).toBe(actionType)
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should fail with invalid token', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.performSecuredAction('invalid-token', 'test-action')
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow()
    })

    it('should handle authorization errors with Effect patterns', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* Effect.match(authService.performSecuredAction('invalid', 'test'), {
          onFailure: (error) => {
            if (error._tag === 'AuthorizationError') {
              return { type: 'authorization', message: error.message, code: error.code }
            }
            return { type: 'unknown', message: error.message }
          },
          onSuccess: (data) => ({ type: 'success', data })
        })
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result.type).toBe('authorization')
      if ('message' in result) {
        expect(result.message).toMatch(/decode|format|expired/i)
      }
    })
  })

  describe('getPublicGreeting', () => {
    it('should generate public greeting', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.getPublicGreeting()
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(GreetingResult)
      expect(result.message).toBe('Hello! Welcome to the Vibe Lottery authentication demo.')
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(result.serverTime).toMatch(/\d/)
    })

    it('should never fail', async () => {
      const program = Effect.gen(function* () {
        const authService = yield* AuthService
        const result = yield* authService.getPublicGreeting()
        return result
      })

      // This should not throw
      const result = await RuntimeClient.runPromise(program)
      expect(result).toBeDefined()
    })
  })
})
import { createServerFn } from '@tanstack/react-start'
import { Effect, Schema } from 'effect'
import { RuntimeServer } from '../services/RuntimeServer'
import { 
  AuthService, 
  LoginCredentials, 
  AuthenticationError, 
  AuthorizationError,
  TokenError 
} from '../services/AuthService'

// Login server function with full Effect integration
export const loginUser = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid login data')
    }
    
    const { username, password } = data
    
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required')
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required')
    }
    
    return { username: username.trim(), password: password.trim() }
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      
      // Create credentials with schema validation
      const credentials = new LoginCredentials({
        username: data.username,
        password: data.password
      })
      
      // Authenticate user
      const token = yield* authService.authenticate(credentials)
      
      yield* Effect.log(`Login successful for user: ${data.username}`)
      return token
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error._tag === 'AuthenticationError') {
            return {
              success: false as const,
              error: error.message,
              code: error.code
            }
          }
          return {
            success: false as const,
            error: 'Authentication failed',
            code: 'AUTH_ERROR'
          }
        },
        onSuccess: (token) => ({
          success: true as const,
          data: {
            token: token.token,
            expiresAt: token.expiresAt,
            userId: token.userId
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Secured action server function
export const performSecuredAction = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid request data')
    }
    
    const { token, actionType } = data
    
    if (!token || typeof token !== 'string') {
      throw new Error('Authentication token is required')
    }
    
    if (!actionType || typeof actionType !== 'string') {
      throw new Error('Action type is required')
    }
    
    return { token: token.trim(), actionType: actionType.trim() }
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      
      // Perform secured action with token validation
      const result = yield* authService.performSecuredAction(data.token, data.actionType)
      
      yield* Effect.log(`Secured action completed: ${data.actionType}`)
      return result
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error._tag === 'AuthorizationError') {
            return {
              success: false as const,
              error: error.message,
              code: error.code
            }
          }
          if (error._tag === 'TokenError') {
            return {
              success: false as const,
              error: error.message,
              code: error.code
            }
          }
          return {
            success: false as const,
            error: 'Action failed',
            code: 'ACTION_ERROR'
          }
        },
        onSuccess: (result) => ({
          success: true as const,
          data: {
            message: result.message,
            timestamp: result.timestamp,
            userId: result.userId,
            actionType: result.actionType
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Public greeting server function (no authentication required)
export const getPublicGreeting = createServerFn({ method: 'GET' })
  .validator((data: any) => {
    // No validation needed for public endpoint
    return {}
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      
      // Get public greeting
      const greeting = yield* authService.getPublicGreeting()
      
      yield* Effect.log('Public greeting served')
      return greeting
    }).pipe(
      Effect.match({
        onFailure: (error) => ({
          success: false as const,
          error: 'Failed to get greeting',
          code: 'GREETING_ERROR'
        }),
        onSuccess: (greeting) => ({
          success: true as const,
          data: {
            message: greeting.message,
            timestamp: greeting.timestamp,
            serverTime: greeting.serverTime
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Token validation server function
export const validateAuthToken = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid request data')
    }
    
    const { token } = data
    
    if (!token || typeof token !== 'string') {
      throw new Error('Token is required')
    }
    
    return { token: token.trim() }
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      
      // Validate token and get session
      const session = yield* authService.validateToken(data.token)
      
      yield* Effect.log(`Token validated for user: ${session.userId}`)
      return session
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error._tag === 'TokenError') {
            return {
              success: false as const,
              error: error.message,
              code: error.code
            }
          }
          return {
            success: false as const,
            error: 'Token validation failed',
            code: 'VALIDATION_ERROR'
          }
        },
        onSuccess: (session) => ({
          success: true as const,
          data: {
            userId: session.userId,
            username: session.username,
            isAuthenticated: session.isAuthenticated,
            loginTime: session.loginTime
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Demo action that shows Effect retry and timeout patterns
export const resilientAction = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    const { token, shouldFail } = data || {}
    
    return { 
      token: token || '', 
      shouldFail: Boolean(shouldFail) 
    }
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      
      // Validate token if provided
      if (data.token) {
        yield* authService.validateToken(data.token)
      }
      
      // Simulate potential failure
      if (data.shouldFail && Math.random() < 0.7) {
        return yield* Effect.fail(
          new Error('Simulated network failure')
        )
      }
      
      yield* Effect.sleep('1000 millis')
      
      return {
        message: 'Resilient action completed successfully',
        timestamp: new Date().toISOString(),
        retries: 'This action supports automatic retries'
      }
    }).pipe(
      Effect.retry({ times: 3 }),
      Effect.timeout('5000 millis')
    ).pipe(
      Effect.match({
        onFailure: (error) => ({
          success: false as const,
          error: error instanceof Error ? error.message : 'Action failed',
          code: 'RESILIENT_ACTION_ERROR'
        }),
        onSuccess: (result) => ({
          success: true as const,
          data: result
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })
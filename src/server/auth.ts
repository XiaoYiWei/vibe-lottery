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

// Simple validation schemas - working approach
const LoginDataSchema = Schema.Struct({
  username: Schema.String,
  password: Schema.String
})

// Validation error for the validator
class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  message: Schema.String,
  field: Schema.optional(Schema.String)
}) {}

// Login server function with idiomatic schema validation
export const loginUser = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    try {
      // Simple schema validation with trimming and basic checks
      const validated = Schema.decodeUnknownSync(LoginDataSchema)(data)
      
      if (!validated.username || !validated.password) {
        throw new Error('Username and password are required')
      }
      
      return {
        username: validated.username.trim(),
        password: validated.password.trim()
      }
    } catch (error) {
      throw new Error(`Login validation failed: ${error.message}`)
    }
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

const SecuredActionSchema = Schema.Struct({
  token: Schema.String,
  actionType: Schema.String
})

// Secured action server function
export const performSecuredAction = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    try {
      const validated = Schema.decodeUnknownSync(SecuredActionSchema)(data)
      
      if (!validated.token || !validated.actionType) {
        throw new Error('Token and action type are required')
      }
      
      return {
        token: validated.token.trim(),
        actionType: validated.actionType.trim()
      }
    } catch (error) {
      throw new Error(`Secured action validation failed: ${error.message}`)
    }
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

const TokenValidationSchema = Schema.Struct({
  token: Schema.String
})

// Token validation server function
export const validateAuthToken = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    try {
      const validated = Schema.decodeUnknownSync(TokenValidationSchema)(data)
      
      if (!validated.token) {
        throw new Error('Token is required')
      }
      
      return {
        token: validated.token.trim()
      }
    } catch (error) {
      throw new Error(`Token validation failed: ${error.message}`)
    }
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

const ResilientActionSchema = Schema.Struct({
  token: Schema.optional(Schema.String),
  shouldFail: Schema.optional(Schema.Boolean)
})

// Demo action that shows Effect retry and timeout patterns
export const resilientAction = createServerFn({ method: 'POST' })
  .validator((data: any) => {
    try {
      // Accept undefined/null data gracefully for resilient action
      const dataToValidate = data || {}
      const validated = Schema.decodeUnknownSync(ResilientActionSchema)(dataToValidate)
      
      return {
        token: validated.token || '',
        shouldFail: Boolean(validated.shouldFail)
      }
    } catch (error) {
      throw new Error(`Resilient action validation failed: ${error.message}`)
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
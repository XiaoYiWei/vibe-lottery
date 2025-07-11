import { Effect, Schema, Context, Layer } from 'effect'

// Authentication data schemas
export class LoginCredentials extends Schema.Class<LoginCredentials>('LoginCredentials')({
  username: Schema.String,
  password: Schema.String
}) {}

export class AuthToken extends Schema.Class<AuthToken>('AuthToken')({
  token: Schema.String,
  expiresAt: Schema.Number,
  userId: Schema.String
}) {}

export class UserSession extends Schema.Class<UserSession>('UserSession')({
  userId: Schema.String,
  username: Schema.String,
  isAuthenticated: Schema.Boolean,
  loginTime: Schema.Number
}) {}

export class SecuredActionResult extends Schema.Class<SecuredActionResult>('SecuredActionResult')({
  message: Schema.String,
  timestamp: Schema.String,
  userId: Schema.String,
  actionType: Schema.String
}) {}

export class GreetingResult extends Schema.Class<GreetingResult>('GreetingResult')({
  message: Schema.String,
  timestamp: Schema.String,
  serverTime: Schema.String
}) {}

// Tagged error types
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()('AuthenticationError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}

export class AuthorizationError extends Schema.TaggedError<AuthorizationError>()('AuthorizationError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}

export class TokenError extends Schema.TaggedError<TokenError>()('TokenError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}

// Authentication service interface
interface AuthService {
  readonly authenticate: (credentials: LoginCredentials) => Effect.Effect<AuthToken, AuthenticationError>
  readonly validateToken: (token: string) => Effect.Effect<UserSession, TokenError>
  readonly performSecuredAction: (token: string, actionType: string) => Effect.Effect<SecuredActionResult, AuthorizationError | TokenError>
  readonly getPublicGreeting: () => Effect.Effect<GreetingResult, never>
}

// JWT token utilities with Effect
const generateToken = (userId: string): Effect.Effect<string, never> =>
  Effect.gen(function* () {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    }
    
    // Simple base64 encoding for demo purposes
    const token = btoa(JSON.stringify(payload))
    yield* Effect.log(`Generated token for user: ${userId}`)
    return token
  })

const decodeToken = (token: string): Effect.Effect<{ userId: string; exp: number }, TokenError> =>
  Effect.gen(function* () {
    try {
      const decoded = JSON.parse(atob(token))
      
      if (!decoded.userId || !decoded.exp) {
        return yield* Effect.fail(
          new TokenError({ 
            message: 'Invalid token format', 
            code: 'INVALID_FORMAT' 
          })
        )
      }
      
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return yield* Effect.fail(
          new TokenError({ 
            message: 'Token has expired', 
            code: 'TOKEN_EXPIRED' 
          })
        )
      }
      
      yield* Effect.log(`Token validated for user: ${decoded.userId}`)
      return { userId: decoded.userId, exp: decoded.exp }
    } catch (error) {
      return yield* Effect.fail(
        new TokenError({ 
          message: 'Failed to decode token', 
          code: 'DECODE_ERROR' 
        })
      )
    }
  })

// Create the AuthService implementation
export const AuthService = Effect.Service<AuthService>()('AuthService', {
  effect: Effect.succeed({
    authenticate: (credentials: LoginCredentials) =>
      Effect.gen(function* () {
        yield* Effect.log(`Authentication attempt for user: ${credentials.username}`)
        
        // Validate username is 'admin'
        if (credentials.username !== 'admin') {
          return yield* Effect.fail(
            new AuthenticationError({ 
              message: 'Invalid username. Only "admin" is allowed.', 
              code: 'INVALID_USERNAME' 
            })
          )
        }
        
        // Accept any password for demo purposes
        if (!credentials.password || credentials.password.trim().length === 0) {
          return yield* Effect.fail(
            new AuthenticationError({ 
              message: 'Password is required', 
              code: 'PASSWORD_REQUIRED' 
            })
          )
        }
        
        yield* Effect.sleep('500 millis') // Simulate auth delay
        
        const token = yield* generateToken(credentials.username)
        const authToken = new AuthToken({
          token,
          expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
          userId: credentials.username
        })
        
        yield* Effect.log(`Authentication successful for user: ${credentials.username}`)
        return authToken
      }),

    validateToken: (token: string) =>
      Effect.gen(function* () {
        yield* Effect.log(`Validating token...`)
        
        if (!token) {
          return yield* Effect.fail(
            new TokenError({ 
              message: 'Token is required', 
              code: 'TOKEN_REQUIRED' 
            })
          )
        }
        
        const decoded = yield* decodeToken(token)
        
        const session = new UserSession({
          userId: decoded.userId,
          username: decoded.userId,
          isAuthenticated: true,
          loginTime: Date.now()
        })
        
        yield* Effect.log(`Token validation successful for user: ${decoded.userId}`)
        return session
      }),

    performSecuredAction: (token: string, actionType: string) =>
      Effect.gen(function* () {
        yield* Effect.log(`Performing secured action: ${actionType}`)
        
        // Validate token first
        const session = yield* Effect.mapError(
          decodeToken(token),
          (error) => new AuthorizationError({ 
            message: error.message, 
            code: error.code 
          })
        )
        
        yield* Effect.sleep('300 millis') // Simulate processing time
        
        const result = new SecuredActionResult({
          message: `Secured action "${actionType}" completed successfully`,
          timestamp: new Date().toISOString(),
          userId: session.userId,
          actionType
        })
        
        yield* Effect.log(`Secured action completed for user: ${session.userId}`)
        return result
      }),

    getPublicGreeting: () =>
      Effect.gen(function* () {
        yield* Effect.log('Generating public greeting')
        yield* Effect.sleep('200 millis') // Simulate processing
        
        const now = new Date()
        const greeting = new GreetingResult({
          message: `Hello! Welcome to the Vibe Lottery authentication demo.`,
          timestamp: now.toISOString(),
          serverTime: now.toLocaleString()
        })
        
        yield* Effect.log('Public greeting generated')
        return greeting
      })
  })
})

// Context for client-side authentication state
export interface AuthState {
  readonly token: string | null
  readonly isAuthenticated: boolean
  readonly user: UserSession | null
}

export class AuthContext extends Context.Tag('AuthContext')<AuthContext, AuthState>() {
  static initial: AuthState = {
    token: null,
    isAuthenticated: false,
    user: null
  }
  
  static fromToken = (token: string | null, user: UserSession | null): AuthState => ({
    token,
    isAuthenticated: token !== null && user !== null,
    user
  })
}

// Export for backward compatibility
export const AuthenticationService = AuthService
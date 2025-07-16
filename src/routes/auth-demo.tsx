import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Effect, Schema } from 'effect'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { AuthService } from '../services/AuthService'
import { RuntimeClient } from '../services/RuntimeClient'

export const Route = createFileRoute('/auth-demo')({
  component: AuthDemoComponent
})

// Schema classes for type safety
export class AuthResult extends Schema.Class<AuthResult>('AuthResult')({
  success: Schema.Boolean,
  data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  error: Schema.optional(Schema.String),
  code: Schema.optional(Schema.String)
}) {}

export class AuthState extends Schema.Class<AuthState>('AuthState')({
  token: Schema.NullOr(Schema.String),
  isAuthenticated: Schema.Boolean,
  user: Schema.NullOr(Schema.Unknown)
}) {}

function AuthDemoComponent() {
  // Authentication state
  const [authState, setAuthState] = useState<AuthState>(new AuthState({
    token: null,
    isAuthenticated: false,
    user: null
  }))

  // Form state
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const [isLogging, setIsLogging] = useState(false)
  const [loginResult, setLoginResult] = useState<AuthResult | null>(null)

  // Action states
  const [securedResult, setSecuredResult] = useState<AuthResult | null>(null)
  const [greetingResult, setGreetingResult] = useState<AuthResult | null>(null)
  const [isSecuredLoading, setIsSecuredLoading] = useState(false)
  const [isGreetingLoading, setIsGreetingLoading] = useState(false)
  const [isResilientLoading, setIsResilientLoading] = useState(false)
  const [resilientResult, setResilientResult] = useState<AuthResult | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('auth-token')
      if (savedToken) {
        validateStoredToken(savedToken)
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error)
    }
  }, [])

  const validateStoredToken = (token: string) => {
    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      const session = yield* authService.validateToken(token)
      
      setAuthState(new AuthState({
        token,
        isAuthenticated: true,
        user: session
      }))
    })

    const handleError = (error: unknown) => {
      localStorage.removeItem('auth-token')
      console.error('Token validation failed:', error)
    }

    RuntimeClient.runPromise(program).catch(handleError)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLogging(true)
    setLoginResult(null)

    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      const credentials = { username, password }
      const authToken = yield* authService.authenticate(credentials)
      
      localStorage.setItem('auth-token', authToken.token)
      
      setAuthState(new AuthState({
        token: authToken.token,
        isAuthenticated: true,
        user: {
          userId: authToken.userId,
          username: authToken.userId
        }
      }))

      setLoginResult(new AuthResult({
        success: true,
        data: {
          token: authToken.token,
          userId: authToken.userId,
          expiresAt: authToken.expiresAt
        }
      }))
    })

    const handleResult = Effect.match(program, {
      onFailure: (error) => {
        setLoginResult(new AuthResult({
          success: false,
          error: error.message,
          code: 'code' in error ? error.code : 'AUTH_ERROR'
        }))
      },
      onSuccess: () => {
        // Success handling is done in the program
      }
    })

    RuntimeClient.runPromise(handleResult).finally(() => {
      setIsLogging(false)
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    setAuthState(new AuthState({
      token: null,
      isAuthenticated: false,
      user: null
    }))
    setLoginResult(null)
    setSecuredResult(null)
    setGreetingResult(null)
    setResilientResult(null)
  }

  const handleSecuredAction = () => {
    if (!authState.token) return

    setIsSecuredLoading(true)
    setSecuredResult(null)

    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      const result = yield* authService.performSecuredAction(authState.token!, 'admin-operation')
      
      setSecuredResult(new AuthResult({
        success: true,
        data: {
          message: result.message,
          actionType: result.actionType,
          userId: result.userId,
          timestamp: result.timestamp
        }
      }))
    })

    const handleResult = Effect.match(program, {
      onFailure: (error) => {
        setSecuredResult(new AuthResult({
          success: false,
          error: error.message,
          code: 'code' in error ? error.code : 'SECURED_ACTION_ERROR'
        }))
      },
      onSuccess: () => {
        // Success handling is done in the program
      }
    })

    RuntimeClient.runPromise(handleResult).finally(() => {
      setIsSecuredLoading(false)
    })
  }

  const handleGreeting = () => {
    setIsGreetingLoading(true)
    setGreetingResult(null)

    const program = Effect.gen(function* () {
      const authService = yield* AuthService
      const result = yield* authService.getPublicGreeting()
      
      setGreetingResult(new AuthResult({
        success: true,
        data: {
          message: result.message,
          serverTime: result.serverTime,
          timestamp: result.timestamp
        }
      }))
    })

    const handleResult = Effect.match(program, {
      onFailure: (error) => {
        setGreetingResult(new AuthResult({
          success: false,
          error: String(error),
          code: 'GREETING_ERROR'
        }))
      },
      onSuccess: () => {
        // Success handling is done in the program
      }
    })

    RuntimeClient.runPromise(handleResult).finally(() => {
      setIsGreetingLoading(false)
    })
  }

  const handleResilientAction = () => {
    setIsResilientLoading(true)
    setResilientResult(null)

    // Simulate a resilient action with retry logic
    const program = Effect.gen(function* () {
      // Create a mock resilient operation
      const operation = Effect.gen(function* () {
        const shouldFail = Math.random() < 0.5
        if (shouldFail) {
          yield* Effect.fail(new Error('Simulated failure'))
        }
        return 'Operation succeeded'
      })

      const resilientOperation = operation.pipe(
        Effect.retry({ times: 3 }),
        Effect.timeout('5 seconds')
      )

      const result = yield* resilientOperation
      
      setResilientResult(new AuthResult({
        success: true,
        data: {
          message: result,
          retries: 'Completed with retry logic',
          timestamp: new Date().toISOString()
        }
      }))
    })

    const handleResult = Effect.match(program, {
      onFailure: (error) => {
        setResilientResult(new AuthResult({
          success: false,
          error: error.message,
          code: 'RESILIENT_ACTION_ERROR'
        }))
      },
      onSuccess: () => {
        // Success handling is done in the program
      }
    })

    RuntimeClient.runPromise(handleResult).finally(() => {
      setIsResilientLoading(false)
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authentication Demo with Effect-TS
        </h1>
        <p className="text-gray-600">
          Complete authentication flow with Effect patterns, token management, and error handling
        </p>
      </div>

      {/* Authentication Status */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              authState.isAuthenticated ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="font-medium">
              {authState.isAuthenticated 
                ? `Authenticated as ${(authState.user as any)?.username || 'Unknown User'}` 
                : 'Not authenticated'
              }
            </span>
          </div>
          {authState.isAuthenticated && (
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          )}
        </div>
      </Card>

      {/* Login Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Login Form</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username (only "admin" accepted)
            </label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLogging || authState.isAuthenticated}
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password (any value accepted)
            </label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLogging || authState.isAuthenticated}
              placeholder="Enter password"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLogging || authState.isAuthenticated}
            variant={isLogging ? 'secondary' : 'default'}
          >
            {isLogging ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {loginResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            loginResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {loginResult.success ? (
              <div>
                <h3 className="font-semibold text-green-900 mb-2">✅ Login Successful!</h3>
                <div className="text-sm space-y-1">
                  <p><strong>User ID:</strong> {String(loginResult.data?.userId || 'N/A')}</p>
                  <p><strong>Token expires:</strong> {loginResult.data?.expiresAt ? new Date(loginResult.data.expiresAt as number).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-red-900 mb-2">❌ Login Failed</h3>
                <p><strong>Error:</strong> {loginResult.error}</p>
                {loginResult.code && <p><strong>Code:</strong> {loginResult.code}</p>}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Actions Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Secured Action */}
          <div className="space-y-2">
            <Button
              onClick={handleSecuredAction}
              disabled={!authState.isAuthenticated || isSecuredLoading}
              variant={isSecuredLoading ? 'secondary' : 'default'}
              className="w-full"
            >
              {isSecuredLoading ? 'Loading...' : 'Secured Action'}
            </Button>
            <p className="text-xs text-gray-500">Requires authentication token</p>
          </div>

          {/* Public Greeting */}
          <div className="space-y-2">
            <Button
              onClick={handleGreeting}
              disabled={isGreetingLoading}
              variant={isGreetingLoading ? 'secondary' : 'outline'}
              className="w-full"
            >
              {isGreetingLoading ? 'Loading...' : 'Get Greeting'}
            </Button>
            <p className="text-xs text-gray-500">No authentication required</p>
          </div>

          {/* Resilient Action */}
          <div className="space-y-2">
            <Button
              onClick={handleResilientAction}
              disabled={isResilientLoading}
              variant={isResilientLoading ? 'secondary' : 'destructive'}
              className="w-full"
            >
              {isResilientLoading ? 'Retrying...' : 'Resilient Action'}
            </Button>
            <p className="text-xs text-gray-500">Demonstrates Effect retry patterns</p>
          </div>
        </div>

        {/* Results Display */}
        <div className="space-y-4">
          {securedResult && (
            <div className={`p-4 rounded-lg border ${
              securedResult.success 
                ? 'bg-blue-50 border-blue-200 text-blue-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <h4 className="font-semibold mb-2">Secured Action Result:</h4>
              {securedResult.success ? (
                <div className="text-sm space-y-1">
                  <p><strong>Message:</strong> {String(securedResult.data?.message || 'N/A')}</p>
                  <p><strong>Action Type:</strong> {String(securedResult.data?.actionType || 'N/A')}</p>
                  <p><strong>User:</strong> {String(securedResult.data?.userId || 'N/A')}</p>
                  <p><strong>Timestamp:</strong> {String(securedResult.data?.timestamp || 'N/A')}</p>
                </div>
              ) : (
                <p className="text-sm">{securedResult.error}</p>
              )}
            </div>
          )}

          {greetingResult && (
            <div className={`p-4 rounded-lg border ${
              greetingResult.success 
                ? 'bg-purple-50 border-purple-200 text-purple-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <h4 className="font-semibold mb-2">Public Greeting Result:</h4>
              {greetingResult.success ? (
                <div className="text-sm space-y-1">
                  <p><strong>Message:</strong> {String(greetingResult.data?.message || 'N/A')}</p>
                  <p><strong>Server Time:</strong> {String(greetingResult.data?.serverTime || 'N/A')}</p>
                  <p><strong>Timestamp:</strong> {String(greetingResult.data?.timestamp || 'N/A')}</p>
                </div>
              ) : (
                <p className="text-sm">{greetingResult.error}</p>
              )}
            </div>
          )}

          {resilientResult && (
            <div className={`p-4 rounded-lg border ${
              resilientResult.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
              <h4 className="font-semibold mb-2">Resilient Action Result:</h4>
              {resilientResult.success ? (
                <div className="text-sm space-y-1">
                  <p><strong>Message:</strong> {String(resilientResult.data?.message || 'N/A')}</p>
                  <p><strong>Info:</strong> {String(resilientResult.data?.retries || 'N/A')}</p>
                  <p><strong>Timestamp:</strong> {String(resilientResult.data?.timestamp || 'N/A')}</p>
                </div>
              ) : (
                <p className="text-sm">
                  <strong>Error after retries:</strong> {resilientResult.error}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Information Section */}
      <Card className="p-6 bg-indigo-50 border-indigo-200">
        <h2 className="text-xl font-semibold text-indigo-900 mb-4">Effect-TS Authentication Features</h2>
        <div className="text-indigo-800 space-y-2">
          <p>• <code className="bg-indigo-100 px-1 rounded">Effect.Service</code> pattern for authentication logic</p>
          <p>• <code className="bg-indigo-100 px-1 rounded">Schema.Class</code> for type-safe data models</p>
          <p>• <code className="bg-indigo-100 px-1 rounded">TaggedError</code> for declarative error handling</p>
          <p>• <code className="bg-indigo-100 px-1 rounded">Effect.gen</code> workflows for async operations</p>
          <p>• <code className="bg-indigo-100 px-1 rounded">Effect.match</code> for success/failure handling</p>
          <p>• <code className="bg-indigo-100 px-1 rounded">Effect.retry</code> and <code className="bg-indigo-100 px-1 rounded">Effect.timeout</code> for resilience</p>
          <p>• JWT token management with automatic validation</p>
          <p>• Layer composition with dependency injection</p>
        </div>
      </Card>
    </div>
  )
}
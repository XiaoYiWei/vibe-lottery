import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { fetchApiData, fetchUserData } from '../server/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export const Route = createFileRoute('/async-demo')({
  component: AsyncDemoComponent
})

interface ApiResult {
  success: boolean
  data?: any
  error?: string
  code?: string
}

function AsyncDemoComponent() {
  const [result, setResult] = useState<ApiResult | null>(null)
  const [userResult, setUserResult] = useState<ApiResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [userId, setUserId] = useState('123')

  // Bind server functions to component
  const serverFetch = useServerFn(fetchApiData)
  const serverFetchUser = useServerFn(fetchUserData)

  const handleAsyncClick = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await serverFetch({ 
        data: { delay: 1500 } 
      })
      setResult(response)
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        code: 'CLIENT_ERROR'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchUser = async () => {
    setIsUserLoading(true)
    setUserResult(null)
    
    try {
      const response = await serverFetchUser({ 
        data: { userId } 
      })
      setUserResult(response)
    } catch (err) {
      setUserResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        code: 'CLIENT_ERROR'
      })
    } finally {
      setIsUserLoading(false)
    }
  }

  const handleQuickFetch = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await serverFetch({ 
        data: { delay: 100 } 
      })
      setResult(response)
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        code: 'CLIENT_ERROR'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Effect + TanStack Start Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating async operations with Effect-TS and server functions
        </p>
      </div>

      {/* API Data Fetching Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">API Data Fetching</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleAsyncClick}
              disabled={isLoading}
              variant={isLoading ? 'secondary' : 'primary'}
            >
              {isLoading ? 'Loading...' : 'Fetch Data (1.5s delay)'}
            </Button>
            
            <Button
              onClick={handleQuickFetch}
              disabled={isLoading}
              variant="outline"
            >
              Quick Fetch (0.1s delay)
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {result.success ? (
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">✅ Success!</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
                  <p><strong>Message:</strong> {result.error}</p>
                  {result.code && <p><strong>Code:</strong> {result.code}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* User Data Fetching Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Data Fetching</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID (try 'invalid' for error)"
              />
            </div>
            
            <Button
              onClick={handleFetchUser}
              disabled={isUserLoading || !userId.trim()}
              variant={isUserLoading ? 'secondary' : 'primary'}
            >
              {isUserLoading ? 'Loading...' : 'Fetch User'}
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            💡 Try entering "invalid" as the user ID to see error handling in action
          </div>

          {userResult && (
            <div className={`p-4 rounded-lg border ${
              userResult.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {userResult.success ? (
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">✅ User Found!</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(userResult.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
                  <p><strong>Message:</strong> {userResult.error}</p>
                  {userResult.code && <p><strong>Code:</strong> {userResult.code}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Information Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">How It Works</h2>
        <div className="text-blue-800 space-y-2">
          <p>• Server functions are defined with <code className="bg-blue-100 px-1 rounded">createServerFn</code></p>
          <p>• Effect programs handle async operations and error management</p>
          <p>• <code className="bg-blue-100 px-1 rounded">useServerFn</code> hook binds server functions to React components</p>
          <p>• <code className="bg-blue-100 px-1 rounded">Effect.match</code> provides declarative success/failure handling</p>
          <p>• All operations are type-safe with proper error boundaries</p>
        </div>
      </Card>
    </div>
  )
}
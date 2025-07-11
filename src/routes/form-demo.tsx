import { createFileRoute } from '@tanstack/react-router'
import { useState, useActionState } from 'react'
import { processMessage } from '../server/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export const Route = createFileRoute('/form-demo')({
  component: FormDemoComponent
})

interface FormState {
  success?: boolean
  data?: any
  error?: string
  code?: string | undefined
  field?: string | undefined
}

function FormDemoComponent() {
  const [streamData, setStreamData] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // Server action handler
  const handleFormAction = async (prevState: FormState | null, formData: FormData): Promise<FormState> => {
    try {
      const result = await processMessage({ data: formData })
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'CLIENT_ERROR'
      }
    }
  }

  const [state, formAction, isPending] = useActionState(handleFormAction, null)

  const handleStreamEvents = async () => {
    setIsStreaming(true)
    setStreamData([])

    try {
      const response = await fetch('/api/stream-events')
      
      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6))
              setStreamData(prev => [...prev, JSON.stringify(eventData, null, 2)])
            } catch (e) {
              setStreamData(prev => [...prev, line.slice(6)])
            }
          } else if (line.trim()) {
            setStreamData(prev => [...prev, line])
          }
        }
      }
    } catch (error) {
      setStreamData(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Form Processing with Effect
        </h1>
        <p className="text-gray-600">
          Server actions and streaming with Effect-TS integration
        </p>
      </div>

      {/* Form Processing Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Message Processing Form</h2>
        
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message to Process
            </label>
            <Input
              type="text"
              id="message"
              name="message"
              required
              placeholder="Enter a message to process (try leaving empty for validation error)"
              disabled={isPending}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isPending}
            variant={isPending ? 'secondary' : 'default'}
          >
            {isPending ? 'Processing...' : 'Process Message'}
          </Button>
        </form>

        {state && (
          <div className={`mt-4 p-4 rounded-lg border ${
            state.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {state.success ? (
              <div>
                <h3 className="font-semibold text-green-900 mb-2">✅ Message Processed!</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Original:</strong> {state.data?.original}</p>
                  <p><strong>Processed:</strong> {state.data?.processed}</p>
                  <p><strong>Word Count:</strong> {state.data?.wordCount}</p>
                  <p><strong>Timestamp:</strong> {state.data?.timestamp}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-red-900 mb-2">❌ Processing Error</h3>
                <p><strong>Message:</strong> {state.error}</p>
                {state.code && <p><strong>Code:</strong> {state.code}</p>}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Streaming Events Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Real-time Event Streaming</h2>
        
        <div className="space-y-4">
          <Button
            onClick={handleStreamEvents}
            disabled={isStreaming}
            variant={isStreaming ? 'secondary' : 'default'}
          >
            {isStreaming ? 'Streaming...' : 'Start Event Stream'}
          </Button>

          {streamData.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              <div className="text-gray-400 mb-2">Event Stream Output:</div>
              {streamData.map((item, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{index + 1}]</span> {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Information Section */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">Form Processing Features</h2>
        <div className="text-purple-800 space-y-2">
          <p>• <code className="bg-purple-100 px-1 rounded">useActionState</code> for React 19 server actions</p>
          <p>• FormData validation with Zod schemas</p>
          <p>• Effect programs for async message processing</p>
          <p>• Server-sent events with ReadableStream</p>
          <p>• Automatic loading states and error boundaries</p>
          <p>• Progressive enhancement (works without JavaScript)</p>
        </div>
      </Card>
    </div>
  )
}
import { createServerFn } from '@tanstack/react-start'
import { Effect } from 'effect'
import { RuntimeServer } from '../services/RuntimeServer'
import { Api, ApiError, NetworkError, ValidationError } from '../services/ApiService'

// Server function for fetching data with optional delay
export const fetchApiData = createServerFn({ method: 'GET' })
  .validator((data: any) => {
    const defaultData = { delay: 1000 }
    if (!data || typeof data !== 'object') {
      return defaultData
    }
    return {
      delay: typeof (data as any).delay === 'number' ? (data as any).delay : defaultData.delay
    }
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const api = yield* Api
      const result = yield* api.fetchData(data?.delay || 1000)
      return result
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error._tag === 'ApiError') {
            return { 
              success: false as const, 
              error: error.message, 
              code: error.code 
            }
          }
          return { 
            success: false as const, 
            error: 'Unknown error occurred',
            code: 'UNKNOWN_ERROR'
          }
        },
        onSuccess: (data) => ({ 
          success: true as const, 
          data: {
            message: data.message,
            timestamp: data.timestamp,
            id: Number(data.id)
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Server function for processing messages
export const processMessage = createServerFn({ method: 'POST' })
  .validator((formData) => {
    if (!(formData instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    
    const message = formData.get('message')?.toString()
    
    if (!message) {
      throw new Error('Message is required')
    }

    return message
  })
  .handler(async ({ data: message }) => {
    const program = Effect.gen(function* () {
      const api = yield* Api
      const result = yield* api.processMessage(message)
      return result
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error._tag === 'ValidationError') {
            return { 
              success: false as const, 
              error: error.message, 
              code: 'VALIDATION_ERROR',
              field: error.field
            }
          }
          if (error._tag === 'ApiError') {
            return { 
              success: false as const, 
              error: error.message, 
              code: error.code 
            }
          }
          return { 
            success: false as const, 
            error: 'Failed to process message',
            code: 'PROCESSING_ERROR'
          }
        },
        onSuccess: (data) => ({ 
          success: true as const, 
          data: {
            original: data.original,
            processed: data.processed,
            wordCount: data.wordCount,
            timestamp: data.timestamp
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Server function for fetching user data
export const fetchUserData = createServerFn({ method: 'GET' })
  .validator((data: any) => {
    if (!data || typeof data !== 'object' || typeof (data as any).userId !== 'string' || (data as any).userId.trim().length === 0) {
      throw new Error('userId is required and must be a non-empty string')
    }
    return { userId: (data as any).userId.trim() }
  })
  .handler(async ({ data }) => {
    const program = Effect.gen(function* () {
      const api = yield* Api
      const result = yield* api.fetchUserData(data.userId)
      return result
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error._tag === 'ApiError') {
            return { 
              success: false as const, 
              error: error.message, 
              code: error.code 
            }
          }
          return { 
            success: false as const, 
            error: 'Failed to fetch user data',
            code: 'USER_FETCH_ERROR'
          }
        },
        onSuccess: (data) => ({ 
          success: true as const, 
          data: {
            id: String(data.id),
            name: data.name,
            email: data.email,
            lastLogin: data.lastLogin
          }
        })
      })
    )

    return RuntimeServer.runPromise(program)
  })

// Server function that demonstrates streaming with Effect
export const streamEvents = createServerFn({
  method: 'GET',
  response: 'raw',
}).handler(async ({ signal }) => {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('Connection established\n'))

      let count = 0
      const interval = setInterval(async () => {
        if (signal.aborted) {
          clearInterval(interval)
          controller.close()
          return
        }

        // Use Effect for generating event data
        const program = Effect.gen(function* () {
          yield* Effect.sleep('100 millis')
          const eventData = {
            event: ++count,
            timestamp: new Date().toISOString(),
            message: `Event ${count} from Effect`
          }
          return JSON.stringify(eventData)
        })

        try {
          const eventData = await RuntimeServer.runPromise(program)
          controller.enqueue(
            new TextEncoder().encode(`data: ${eventData}\n\n`)
          )

          if (count >= 10) {
            clearInterval(interval)
            controller.close()
          }
        } catch (error) {
          console.error('Stream error:', error)
          clearInterval(interval)
          controller.close()
        }
      }, 1000)

      signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
})
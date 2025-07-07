import { Effect, Schema } from 'effect'

// Define the data schema for the API response
export class ApiData extends Schema.Class<ApiData>('ApiData')({
  message: Schema.String,
  timestamp: Schema.Number,
  id: Schema.Number.pipe(Schema.brand('Id'))
}) {}

// Define API error types
export class ApiError extends Schema.TaggedError<ApiError>()('ApiError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}

export class NetworkError extends Schema.TaggedError<NetworkError>()('NetworkError', {
  message: Schema.String
}) {}

// Create the API service
export class ApiService extends Effect.Service<ApiService>()('ApiService', {
  effect: Effect.gen(function* () {
    
    const fetchData = (delay: number = 1000) => 
      Effect.gen(function* () {
        // Simulate network delay
        yield* Effect.sleep(`${delay} millis`)
        
        // Simulate potential failure (10% chance)
        const shouldFail = Math.random() < 0.1
        if (shouldFail) {
          return yield* Effect.fail(
            new ApiError({ 
              message: 'Simulated API failure', 
              code: 'RANDOM_FAILURE' 
            })
          )
        }
        
        // Return successful data
        const data = new ApiData({
          message: 'Hello from Effect API!',
          timestamp: Date.now(),
          id: Math.floor(Math.random() * 1000) as Schema.Brand<number, 'Id'>
        })
        
        yield* Effect.log(`API data fetched: ${data.message}`)
        return data
      })

    const processMessage = (message: string) =>
      Effect.gen(function* () {
        // Validate input
        if (!message || message.trim().length === 0) {
          return yield* Effect.fail(
            new ApiError({ 
              message: 'Message cannot be empty', 
              code: 'VALIDATION_ERROR' 
            })
          )
        }

        // Simulate processing delay
        yield* Effect.sleep('500 millis')
        
        const processedData = {
          original: message,
          processed: message.toUpperCase(),
          wordCount: message.split(' ').length,
          timestamp: new Date().toISOString()
        }
        
        yield* Effect.log(`Message processed: ${message}`)
        return processedData
      })

    const fetchUserData = (userId: string) =>
      Effect.gen(function* () {
        // Simulate database lookup delay
        yield* Effect.sleep('800 millis')
        
        // Simulate user not found (if userId is 'invalid')
        if (userId === 'invalid') {
          return yield* Effect.fail(
            new ApiError({ 
              message: 'User not found', 
              code: 'USER_NOT_FOUND' 
            })
          )
        }
        
        const userData = {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          lastLogin: new Date().toISOString()
        }
        
        yield* Effect.log(`User data fetched for: ${userId}`)
        return userData
      })

    return {
      fetchData,
      processMessage,
      fetchUserData
    } as const
  })
}) {}
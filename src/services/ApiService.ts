import { Effect, Schema } from 'effect'

// Define schemas with branded types following template patterns
export class ApiData extends Schema.Class<ApiData>('ApiData')({
  message: Schema.String,
  timestamp: Schema.Number,
  id: Schema.Number
}) {}

export class ProcessedMessage extends Schema.Class<ProcessedMessage>('ProcessedMessage')({
  original: Schema.String,
  processed: Schema.String,
  wordCount: Schema.Number,
  timestamp: Schema.String
}) {}

export class UserData extends Schema.Class<UserData>('UserData')({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  lastLogin: Schema.String
}) {}

// Define error types using tagged errors
export class ApiError extends Schema.TaggedError<ApiError>()('ApiError', {
  message: Schema.String,
  code: Schema.optional(Schema.String)
}) {}

export class NetworkError extends Schema.TaggedError<NetworkError>()('NetworkError', {
  message: Schema.String
}) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  message: Schema.String,
  field: Schema.optional(Schema.String)
}) {}

// Define the API service interface
interface Api {
  readonly fetchData: (delay?: number) => Effect.Effect<ApiData, ApiError>
  readonly processMessage: (message: string) => Effect.Effect<ProcessedMessage, ValidationError | ApiError>
  readonly fetchUserData: (userId: string) => Effect.Effect<UserData, ApiError>
}

// Create the API service following template patterns
export const Api = Effect.Service<Api>()('Api', {
  effect: Effect.succeed({
    fetchData: (delay: number = 1000) =>
      Effect.gen(function* () {
        yield* Effect.sleep(`${delay} millis`)
        
        // Simulate potential failure (disabled for tests)
        // const shouldFail = Math.random() < 0.1
        // if (shouldFail) {
        //   return yield* Effect.fail(
        //     new ApiError({ 
        //       message: 'Simulated API failure', 
        //       code: 'RANDOM_FAILURE' 
        //     })
        //   )
        // }
        
        const data = new ApiData({
          message: 'Hello from Effect API!',
          timestamp: Date.now(),
          id: Math.floor(Math.random() * 1000)
        })
        
        yield* Effect.log(`API data fetched: ${data.message}`)
        return data
      }),

    processMessage: (message: string) =>
      Effect.gen(function* () {
        if (!message || message.trim().length === 0) {
          return yield* Effect.fail(
            new ValidationError({ 
              message: 'Message cannot be empty',
              field: 'message'
            })
          )
        }

        yield* Effect.sleep('500 millis')
        
        const processedData = new ProcessedMessage({
          original: message,
          processed: message.toUpperCase(),
          wordCount: message.split(' ').length,
          timestamp: new Date().toISOString()
        })
        
        yield* Effect.log(`Message processed: ${message}`)
        return processedData
      }),

    fetchUserData: (userId: string) =>
      Effect.gen(function* () {
        yield* Effect.sleep('800 millis')
        
        if (userId === 'invalid') {
          return yield* Effect.fail(
            new ApiError({ 
              message: 'User not found', 
              code: 'USER_NOT_FOUND' 
            })
          )
        }
        
        const userData = new UserData({
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          lastLogin: new Date().toISOString()
        })
        
        yield* Effect.log(`User data fetched for: ${userId}`)
        return userData
      })
  })
})

// Export for backward compatibility
export const ApiService = Api
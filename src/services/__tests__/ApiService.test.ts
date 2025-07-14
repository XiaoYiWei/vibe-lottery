import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Effect } from 'effect'
import { Api, ApiData, ProcessedMessage, UserData, ApiError, ValidationError } from '../ApiService'
import { RuntimeClient } from '../RuntimeClient'

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchData', () => {
    it('should fetch data successfully', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.fetchData(100)
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(ApiData)
      expect(result.message).toBe('Hello from Effect API!')
      expect(result.timestamp).toBeTypeOf('number')
      expect(result.id).toBeTypeOf('number')
    })

    it('should handle default delay', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.fetchData()
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      expect(result).toBeInstanceOf(ApiData)
    })
  })

  describe('processMessage', () => {
    it('should process message successfully', async () => {
      const testMessage = 'hello world'
      
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.processMessage(testMessage)
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(ProcessedMessage)
      expect(result.original).toBe(testMessage)
      expect(result.processed).toBe('HELLO WORLD')
      expect(result.wordCount).toBe(2)
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should fail with ValidationError for empty message', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.processMessage('')
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow('Message cannot be empty')
    })

    it('should fail with ValidationError for whitespace-only message', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.processMessage('   ')
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow('Message cannot be empty')
    })

    it('should handle Effect pattern matching for validation errors', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* Effect.match(api.processMessage(''), {
          onFailure: (error) => {
            if (error._tag === 'ValidationError') {
              return { type: 'validation', message: error.message, field: error.field }
            }
            return { type: 'unknown', message: error.message }
          },
          onSuccess: (data) => ({ type: 'success', data })
        })
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Message cannot be empty',
        field: 'message'
      })
    })
  })

  describe('fetchUserData', () => {
    it('should fetch user data successfully', async () => {
      const testUserId = 'user123'
      
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.fetchUserData(testUserId)
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toBeInstanceOf(UserData)
      expect(result.id).toBe(testUserId)
      expect(result.name).toBe('User user123')
      expect(result.email).toBe('useruser123@example.com')
      expect(result.lastLogin).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should fail with ApiError for invalid user', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* api.fetchUserData('invalid')
        return result
      })

      await expect(RuntimeClient.runPromise(program)).rejects.toThrow('User not found')
    })

    it('should handle Effect pattern matching for API errors', async () => {
      const program = Effect.gen(function* () {
        const api = yield* Api
        const result = yield* Effect.match(api.fetchUserData('invalid'), {
          onFailure: (error) => {
            if (error._tag === 'ApiError') {
              return { type: 'api', message: error.message, code: error.code }
            }
            return { type: 'unknown', message: error.message }
          },
          onSuccess: (data) => ({ type: 'success', data })
        })
        return result
      })

      const result = await RuntimeClient.runPromise(program)
      
      expect(result).toEqual({
        type: 'api',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    })
  })
})
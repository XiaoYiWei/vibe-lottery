"use server"

import { Effect, Layer } from 'effect'
import { RuntimeServer } from '../services/RuntimeServer'
import { FormDataContext } from '../services/FormData'
import { Api, ValidationError } from '../services/ApiService'

export const processMessageAction = async (prevState: any, formData: FormData) => {
  const program = Effect.gen(function* () {
    const formDataService = yield* FormDataContext
    const message = yield* formDataService.get('message')
    
    if (!message) {
      return yield* Effect.fail(
        new ValidationError({
          message: 'Message is required',
          field: 'message'
        })
      )
    }

    const api = yield* Api
    const result = yield* api.processMessage(message.toString())
    
    return {
      success: true,
      data: {
        original: result.original,
        processed: result.processed,
        wordCount: result.wordCount,
        timestamp: result.timestamp
      }
    }
  }).pipe(
    Effect.catchAll((error) => 
      Effect.succeed({
        success: false,
        error: error instanceof ValidationError ? error.message : 'Processing failed',
        code: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'PROCESSING_ERROR'
      })
    ),
    Effect.provide(Layer.succeed(FormDataContext, FormDataContext.fromFormData(formData)))
  )

  return RuntimeServer.runPromise(program)
}
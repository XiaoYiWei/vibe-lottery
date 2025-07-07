import { Effect, Console } from 'effect'

export const safeAsync = <A, E>(
  promise: () => Promise<A>,
  errorMessage: string = 'Promise failed'
) => 
  Effect.tryPromise({
    try: promise,
    catch: (error) => new Error(`${errorMessage}: ${error}`)
  })

export const logAndReturn = <A>(value: A, message?: string) =>
  Effect.gen(function* () {
    yield* Console.log(message || `Value: ${JSON.stringify(value)}`)
    return value
  })

export const validateInput = <A>(
  value: A, 
  predicate: (value: A) => boolean,
  errorMessage: string
) =>
  Effect.gen(function* () {
    if (!predicate(value)) {
      return yield* Effect.fail(new Error(errorMessage))
    }
    return value
  })

export const withRetry = <A, E>(
  effect: Effect.Effect<A, E>,
  times: number = 3
) =>
  Effect.retry(effect, { times })

export const timeout = <A, E>(
  effect: Effect.Effect<A, E>,
  ms: number
) =>
  Effect.timeout(effect, `${ms} millis`)

export const runSafePromise = <A>(effect: Effect.Effect<A, Error>) =>
  Effect.runPromise(effect)
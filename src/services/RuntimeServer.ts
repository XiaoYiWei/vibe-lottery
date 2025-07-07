import { Effect, Layer, ManagedRuntime } from 'effect'
import { ApiService } from './ApiService'

// Create the main server layer by merging all services
const MainLayer = Layer.mergeAll(
  ApiService.Default
)

// Create the managed runtime for server-side execution
export const RuntimeServer = ManagedRuntime.make(MainLayer)
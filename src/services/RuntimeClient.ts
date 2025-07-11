import { Layer, ManagedRuntime } from 'effect'
import { Api } from './ApiService'

// Create the main client layer by merging all services
const MainLayer = Layer.mergeAll(
  Api.Default
)

// Create the managed runtime for client-side execution
export const RuntimeClient = ManagedRuntime.make(MainLayer)
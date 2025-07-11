import { Layer, ManagedRuntime } from 'effect'
import { Api } from './ApiService'
import { AuthService } from './AuthService'

// Create the main server layer by merging all services
const MainLayer = Layer.mergeAll(
  Api.Default,
  AuthService.Default
)

// Create the managed runtime for server-side execution
export const RuntimeServer = ManagedRuntime.make(MainLayer)
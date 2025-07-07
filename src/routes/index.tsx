import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Effect + TanStack Start
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Demonstrating async operations, error handling, and server functions with Effect-TS
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-blue-600">🚀 Async Demo</CardTitle>
                <CardDescription>
                  Click handlers with server functions and Effect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Interactive components demonstrating:
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li>• useServerFn hook integration</li>
                  <li>• Effect-based async operations</li>
                  <li>• Type-safe error handling</li>
                  <li>• Loading states and UI feedback</li>
                </ul>
                <Link to="/async-demo">
                  <Button className="w-full">
                    Try Async Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-purple-600">📝 Form Demo</CardTitle>
                <CardDescription>
                  Server actions and streaming with Effect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Form processing demonstrating:
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-1">
                  <li>• useActionState for server actions</li>
                  <li>• FormData validation with Zod</li>
                  <li>• Real-time streaming events</li>
                  <li>• Progressive enhancement</li>
                </ul>
                <Link to="/form-demo">
                  <Button className="w-full" variant="outline">
                    Try Form Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Technology Stack
            </h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-blue-600 font-semibold">TanStack Start</div>
                <div className="text-sm text-gray-600">Full-stack React framework</div>
              </div>
              <div>
                <div className="text-green-600 font-semibold">Effect-TS</div>
                <div className="text-sm text-gray-600">Functional programming</div>
              </div>
              <div>
                <div className="text-purple-600 font-semibold">TypeScript</div>
                <div className="text-sm text-gray-600">Type safety</div>
              </div>
              <div>
                <div className="text-indigo-600 font-semibold">Zod</div>
                <div className="text-sm text-gray-600">Runtime validation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
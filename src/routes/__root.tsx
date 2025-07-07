import { 
  createRootRoute, 
  HeadContent, 
  Scripts,
  Outlet,
  Link 
} from '@tanstack/react-router'
import * as React from 'react'
import { Providers } from '~/providers'
import '../styles/globals.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { 
        name: 'viewport', 
        content: 'width=device-width, initial-scale=1' 
      },
      { title: 'Vibe Lottery - AI Agent Development System' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Providers>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link 
                    to="/" 
                    className="text-xl font-bold text-gray-900 hover:text-blue-600"
                  >
                    Vibe Lottery
                  </Link>
                </div>
                <div className="flex items-center space-x-8">
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    activeProps={{ className: "text-blue-600 bg-blue-50" }}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/async-demo" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    activeProps={{ className: "text-blue-600 bg-blue-50" }}
                  >
                    Async Demo
                  </Link>
                  <Link 
                    to="/form-demo" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    activeProps={{ className: "text-blue-600 bg-blue-50" }}
                  >
                    Form Demo
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main>
            <Outlet />
          </main>
        </div>
      </Providers>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
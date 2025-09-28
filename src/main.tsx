import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import styles
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { authClient } from './lib/auth-client'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
    },
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  const session = await authClient.getSession()
  const isAuthenticated = !!session.data?.session.id
  root.render(
    <StrictMode>
      <RouterProvider
        router={router}
        context={{
          auth: {
            isAuthenticated,
          },
        }}
      />
    </StrictMode>
  )
}

import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from '@/components/Navbar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main>
            <Outlet />
          </main>
        </div>
        <Toaster richColors position="top-right" />
        <TanStackRouterDevtools />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})

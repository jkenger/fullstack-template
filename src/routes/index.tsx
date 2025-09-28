import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Database, Zap, Shield, Code, Layers, Globe } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            Full-Stack TypeScript Template
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Modern Web Development
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A production-ready template featuring React 19, Hono, Cloudflare Workers,
            Drizzle ORM, and type-safe APIs with comprehensive tooling and documentation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link to="/stack">
                Explore Tech Stack
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/profile">View Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Type-Safe APIs</CardTitle>
              <CardDescription>
                End-to-end type safety with Hono RPC and automatic type inference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Hono web framework with RPC pattern</li>
                <li>• Zod validation with OpenAPI metadata</li>
                <li>• Automatic frontend type generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Cloudflare Workers</CardTitle>
              <CardDescription>
                Deploy to the edge with zero cold starts and global distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Serverless edge computing</li>
                <li>• D1 SQLite database</li>
                <li>• Vite plugin integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Modern Database</CardTitle>
              <CardDescription>
                Type-safe database operations with Drizzle ORM and migrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Drizzle ORM with type safety</li>
                <li>• Automatic migrations</li>
                <li>• Studio database explorer</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>React 19 + TanStack</CardTitle>
              <CardDescription>
                Modern React with file-based routing and server state management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• TanStack Router for routing</li>
                <li>• TanStack Query for server state</li>
                <li>• Shadcn/ui components</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Authentication Ready</CardTitle>
              <CardDescription>
                Better Auth integration with multiple providers and role management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Multiple OAuth providers</li>
                <li>• Role-based access control</li>
                <li>• Session management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Developer Experience</CardTitle>
              <CardDescription>
                Comprehensive tooling for linting, testing, and development workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• ESLint + Prettier configuration</li>
                <li>• Vitest for testing</li>
                <li>• Hot reload development</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Section */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">Built with Modern Technologies</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-4xl mx-auto">
            {[
              'React 19', 'TypeScript', 'Hono', 'Cloudflare',
              'Drizzle', 'TanStack', 'Vite', 'Tailwind',
              'Shadcn/ui', 'Zod', 'ESLint', 'Vitest'
            ].map((tech) => (
              <div key={tech} className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-lg font-semibold">
                  {tech.charAt(0)}
                </div>
                <span className="text-sm font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
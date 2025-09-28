import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ExternalLink,
  Code2,
  Server,
  Database,
  Palette,
  TestTube,
  Wrench,
  Shield,
  Globe,
} from 'lucide-react'

export const Route = createFileRoute('/stack')({
  component: TechStackPage,
})

interface TechItem {
  name: string
  category: string
  description: string
  icon: React.ReactNode
  version?: string
  docs?: string
  features: string[]
}

const techStack: TechItem[] = [
  {
    name: 'React 19',
    category: 'Frontend Framework',
    description:
      'Latest React with improved concurrent features and server components support',
    icon: <Code2 className="w-6 h-6" />,
    version: '^19.1.1',
    docs: 'https://react.dev/',
    features: [
      'Server Components support',
      'Improved concurrent rendering',
      'Built-in compiler optimizations',
      'Enhanced developer experience',
    ],
  },
  {
    name: 'TypeScript',
    category: 'Language',
    description:
      'Strongly typed JavaScript for better development experience and code quality',
    icon: <Code2 className="w-6 h-6" />,
    version: '~5.8.3',
    docs: 'https://www.typescriptlang.org/',
    features: [
      'Static type checking',
      'Enhanced IDE support',
      'Better refactoring tools',
      'Compile-time error detection',
    ],
  },
  {
    name: 'Hono',
    category: 'Backend Framework',
    description:
      'Ultrafast web framework for Cloudflare Workers with excellent TypeScript support',
    icon: <Server className="w-6 h-6" />,
    version: '^4.9.8',
    docs: 'https://hono.dev/',
    features: [
      'Zero cold start',
      'Built-in middleware',
      'OpenAPI integration',
      'RPC client generation',
    ],
  },
  {
    name: 'Cloudflare Workers',
    category: 'Runtime',
    description: 'Serverless edge computing platform with global distribution',
    icon: <Globe className="w-6 h-6" />,
    docs: 'https://developers.cloudflare.com/workers/',
    features: [
      'Edge computing',
      'Zero cold starts',
      'Global distribution',
      'V8 isolates',
    ],
  },
  {
    name: 'Drizzle ORM',
    category: 'Database',
    description:
      'Type-safe ORM for SQL databases with excellent TypeScript integration',
    icon: <Database className="w-6 h-6" />,
    version: '^0.44.5',
    docs: 'https://orm.drizzle.team/',
    features: [
      'Type-safe queries',
      'Migration system',
      'Schema introspection',
      'Multiple database support',
    ],
  },
  {
    name: 'TanStack Router',
    category: 'Routing',
    description:
      'Type-safe router with file-based routing and automatic code splitting',
    icon: <Code2 className="w-6 h-6" />,
    version: '^1.132.2',
    docs: 'https://tanstack.com/router/',
    features: [
      'File-based routing',
      'Type-safe navigation',
      'Automatic code splitting',
      'Search params validation',
    ],
  },
  {
    name: 'TanStack Query',
    category: 'State Management',
    description:
      'Powerful data synchronization for React with caching and background updates',
    icon: <Code2 className="w-6 h-6" />,
    version: '^5.90.2',
    docs: 'https://tanstack.com/query/',
    features: [
      'Automatic caching',
      'Background updates',
      'Optimistic updates',
      'Infinite queries',
    ],
  },
  {
    name: 'Tailwind CSS',
    category: 'Styling',
    description: 'Utility-first CSS framework for rapid UI development',
    icon: <Palette className="w-6 h-6" />,
    version: '^4.1.13',
    docs: 'https://tailwindcss.com/',
    features: [
      'Utility-first approach',
      'Responsive design',
      'Dark mode support',
      'Custom design system',
    ],
  },
  {
    name: 'Shadcn/ui',
    category: 'UI Components',
    description:
      'Beautifully designed components built with Radix UI and Tailwind CSS',
    icon: <Palette className="w-6 h-6" />,
    docs: 'https://ui.shadcn.com/',
    features: [
      'Accessible components',
      'Customizable design',
      'TypeScript support',
      'Copy-paste friendly',
    ],
  },
  {
    name: 'Zod',
    category: 'Validation',
    description:
      'TypeScript-first schema validation with static type inference',
    icon: <Shield className="w-6 h-6" />,
    version: '^4.1.11',
    docs: 'https://zod.dev/',
    features: [
      'Type inference',
      'Runtime validation',
      'Error handling',
      'Schema composition',
    ],
  },
  {
    name: 'Vite',
    category: 'Build Tool',
    description:
      'Fast build tool with instant hot module replacement and optimized bundling',
    icon: <Wrench className="w-6 h-6" />,
    version: '^7.1.2',
    docs: 'https://vitejs.dev/',
    features: [
      'Instant HMR',
      'ES modules support',
      'Plugin ecosystem',
      'Optimized builds',
    ],
  },
  {
    name: 'Vitest',
    category: 'Testing',
    description: 'Vite-native testing framework with Jest compatibility',
    icon: <TestTube className="w-6 h-6" />,
    version: '^3.2.4',
    docs: 'https://vitest.dev/',
    features: [
      'Jest compatibility',
      'Fast execution',
      'ESM support',
      'TypeScript support',
    ],
  },
]

const categories = Array.from(new Set(techStack.map(item => item.category)))

function TechStackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Technology Stack
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl">
              A comprehensive overview of the modern technologies that power
              this template. Each tool has been carefully selected for
              performance, developer experience, and production readiness.
            </p>
          </div>
        </div>

        {/* Architecture Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
            <CardDescription>
              Full-stack TypeScript application with edge computing and
              type-safe APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Frontend</h3>
                <p className="text-sm text-muted-foreground">
                  React 19 with TanStack Router, Query, and Shadcn/ui components
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Backend</h3>
                <p className="text-sm text-muted-foreground">
                  Hono web framework running on Cloudflare Workers edge runtime
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Database</h3>
                <p className="text-sm text-muted-foreground">
                  Cloudflare D1 SQLite with Drizzle ORM for type-safe operations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Sections */}
        <div className="space-y-12 grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map(category => (
            <div key={category} className="space-y-6">
              <h2 className="text-2xl font-bold">{category}</h2>
              <div className="">
                {techStack
                  .filter(item => item.category === category)
                  .map(tech => (
                    <Card
                      key={tech.name}
                      className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm h-full"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                              {tech.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg leading-tight">
                                {tech.name}
                              </CardTitle>
                              {tech.version && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-2"
                                >
                                  {tech.version}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {tech.docs && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex-shrink-0"
                            >
                              <a
                                href={tech.docs}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-60 group-hover:opacity-100 transition-opacity"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <CardDescription className="text-sm mt-3">
                          {tech.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Key Features:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1.5">
                            {tech.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2 mt-0.5 text-primary">
                                  •
                                </span>
                                <span className="leading-relaxed">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Development Workflow */}
        <Card className="mt-12 mb-8">
          <CardHeader>
            <CardTitle>Development Workflow</CardTitle>
            <CardDescription>
              Comprehensive tooling for a smooth development experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Wrench className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">Development</h3>
                <p className="text-sm text-muted-foreground">
                  Hot reload, type checking, linting
                </p>
              </div>
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <TestTube className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">Testing</h3>
                <p className="text-sm text-muted-foreground">
                  Unit tests, integration tests, coverage
                </p>
              </div>
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Code2 className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">Code Quality</h3>
                <p className="text-sm text-muted-foreground">
                  ESLint, Prettier, TypeScript
                </p>
              </div>
              <div className="text-center space-y-3 p-4 border rounded-lg">
                <Globe className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold">Deployment</h3>
                <p className="text-sm text-muted-foreground">
                  Cloudflare Workers, edge deployment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the live demo or check out the documentation to see how it
            all works together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/profile">View Live Demo</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/api/v1/docs" target="_blank" rel="noopener noreferrer">
                API Documentation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

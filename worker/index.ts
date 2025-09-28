import type { Environment } from './config'
import { createServer } from './server'

// Cloudflare Workers handler interface

// Production Export - with proper env handling
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // Optionally log environment info
    console.log('🚀 Request received with env keys:', Object.keys(env || {}))
    console.log('🔧 NODE_ENV:', env.NODE_ENV)
    const app = createServer(env)
    return app.fetch(request, env, ctx)
  },
} satisfies ExportedHandler<Environment>

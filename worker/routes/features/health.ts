import { Hono } from 'hono'
import { createSuccessResponse } from '../../lib/response'

const startTime = Date.now()

// Health and system feature routes
export function createHealthRoutes(/* container: Container */) {
  return (
    new Hono()
      // GET /health - Health check endpoint
      .get('/health', c => {
        const uptime = (Date.now() - startTime) / 1000
        return c.json(
          createSuccessResponse({
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
            uptime,
          })
        )
      })

      // GET /test - Test endpoint to verify API functionality
      .get('/test', c => {
        return c.json(
          createSuccessResponse({
            name: 'Cloudflare',
            message: 'Hono RPC with DI is working!',
            timestamp: new Date().toISOString(),
          })
        )
      })
  )

  // You can add more system/health routes here:
  // GET /status - Detailed system status
  // .get('/status', async (c) => { ... })

  // GET /metrics - System metrics
  // .get('/metrics', async (c) => { ... })
}

import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import type { Container } from '../../container'

// Documentation feature routes - OpenAPI documented endpoints
export function createOpenAPIDocsRoutes(container: Container) {
  const app = new OpenAPIHono()

  const env = container.getContext().env.NODE_ENV

  // Middleware to check environment
  app.use('*', async (c, next) => {
    const isDev = env === 'development'
    const isStaging = env === 'staging'

    if (!isDev && !isStaging) {
      return c.json({ error: 'Documentation not available in production' }, 404)
    }

    await next()
  })

  return (
    app
      // Swagger UI endpoint - serves interactive documentation
      .get(
        '',
        swaggerUI({
          url: '/api/v1/openapi.json',
        })
      )

      // Alternative documentation UI (ReDoc)
      .get('/redoc', c => {
        return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Coop API Documentation</title>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body>
            <redoc spec-url='/api/v1/openapi.json'></redoc>
            <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
          </body>
        </html>
      `)
      })
  )
}

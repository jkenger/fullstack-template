import { createFileRoute, redirect } from '@tanstack/react-router'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export const Route = createFileRoute('/docs')({
  beforeLoad: () => {
    // Only allow access in development or staging
    const isDev = import.meta.env.DEV
    const isStaging = import.meta.env.VITE_ENVIRONMENT === 'staging'

    if (!isDev && !isStaging) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }
  },
  component: ApiDocs,
})

function ApiDocs() {
  return (
    <SwaggerUI
      url="/api/v1/openapi.json"
      docExpansion="list"
      defaultModelsExpandDepth={1}
      defaultModelExpandDepth={1}
    />
  )
}

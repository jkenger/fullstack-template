import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Bug } from 'lucide-react'

export function ErrorTester() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('This is a test error thrown by the ErrorTester component!')
  }

  const throwAsyncError = () => {
    // This won't be caught by error boundary (async errors need different handling)
    setTimeout(() => {
      throw new Error('This is an async error that won\'t be caught by error boundary')
    }, 100)
  }

  const throwRenderError = () => {
    setShouldThrow(true)
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Error Boundary Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use these buttons to test different types of errors and see how the error boundary handles them.
        </p>

        <div className="space-y-2">
          <Button
            variant="destructive"
            onClick={throwRenderError}
            className="w-full"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Throw Render Error (Will be caught)
          </Button>

          <Button
            variant="outline"
            onClick={throwAsyncError}
            className="w-full"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Throw Async Error (Won't be caught)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Render Error:</strong> Thrown during component render - will be caught by error boundary</p>
          <p>• <strong>Async Error:</strong> Thrown asynchronously - won't be caught by error boundary</p>
        </div>
      </CardContent>
    </Card>
  )
}
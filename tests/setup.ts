import { beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  vi.stubEnv('NODE_ENV', 'test')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

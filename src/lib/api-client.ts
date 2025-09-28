import type { AppType } from './../../worker/server'
import { hc } from 'hono/client'

// Shared RPC client instance
export const client = hc<AppType>('/')

import { betterAuth } from 'better-auth'
import { drizzleAdapter, type DB } from 'better-auth/adapters/drizzle'
import type { Environment } from '../config'
import { user, session, account, verification } from '../../auth-schema'
import { customSession } from 'better-auth/plugins'

// Shared Better Auth configuration
function createBetterAuthConfig(options: {
  secret: string
  baseURL: string
  db: unknown
  githubClientId?: string | null
  githubClientSecret?: string | null
  googleClientId?: string | null
  googleClientSecret?: string | null
}) {
  return {
    secret: options.secret,
    baseURL: options.baseURL,
    database: drizzleAdapter(options.db as DB, {
      provider: 'sqlite' as const,
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true when email is configured
      password: {
        hash: async (password: string) => {
          // Use Web Crypto API for password hashing (optimized for Workers)
          const encoder = new TextEncoder()
          const data = encoder.encode(password)
          const salt = crypto.getRandomValues(new Uint8Array(16))

          // Use PBKDF2 with reduced iterations for Workers performance
          const key = await crypto.subtle.importKey(
            'raw',
            data,
            'PBKDF2',
            false,
            ['deriveBits']
          )

          const hashBuffer = await crypto.subtle.deriveBits(
            {
              name: 'PBKDF2',
              salt: salt,
              iterations: 1000, // Much lower than bcrypt for Workers
              hash: 'SHA-256',
            },
            key,
            256
          )

          // Return salt:hash format
          const saltHex = Array.from(salt)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
          const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
          return `${saltHex}:${hashHex}`
        },
        verify: async (data: { password: string; hash: string }) => {
          // Verify password using the same method
          const encoder = new TextEncoder()
          const passwordData = encoder.encode(data.password)
          const [saltHex, expectedHashHex] = data.hash.split(':')

          if (!saltHex || !expectedHashHex) return false

          const salt = new Uint8Array(
            saltHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
          )

          const key = await crypto.subtle.importKey(
            'raw',
            passwordData,
            'PBKDF2',
            false,
            ['deriveBits']
          )

          const hashBuffer = await crypto.subtle.deriveBits(
            {
              name: 'PBKDF2',
              salt: salt,
              iterations: 1000,
              hash: 'SHA-256',
            },
            key,
            256
          )

          const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
          return hashHex === expectedHashHex
        },
      },
    },

    socialProviders: {
      ...(options.githubClientId &&
        options.githubClientSecret && {
          github: {
            clientId: options.githubClientId,
            clientSecret: options.githubClientSecret,
          },
        }),
      ...(options.googleClientId &&
        options.googleClientSecret && {
          google: {
            clientId: options.googleClientId,
            clientSecret: options.googleClientSecret,
          },
        }),
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },

    user: {
      additionalFields: {
        bio: {
          type: 'string' as const,
          required: false,
        },
      },
    },

    advanced: {
      crossSubDomainCookies: {
        enabled: false, // Set to true if using subdomains
      },
    },
    plugins: [
      // If you want to throw custom session, customize here.
      customSession(async ({ user, session }) => {
        return {
          user,
          session,
        }
      }),
    ],
  }
}

// Runtime function that uses environment variables directly
export async function createAuth(env: Environment, db: unknown) {
  // Get required environment variables
  const authSecret = env.BETTER_AUTH_SECRET
  const authUrl = env.BETTER_AUTH_URL

  if (!authSecret || !authUrl) {
    throw new Error(
      'Missing required environment variables: BETTER_AUTH_SECRET, BETTER_AUTH_URL'
    )
  }

  // Get optional OAuth environment variables
  const githubClientId = env.GITHUB_CLIENT_ID || null
  const githubClientSecret = env.GITHUB_CLIENT_SECRET || null
  const googleClientId = env.GOOGLE_CLIENT_ID || null
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET || null

  const config = createBetterAuthConfig({
    secret: authSecret,
    baseURL: authUrl,
    db,
    githubClientId,
    githubClientSecret,
    googleClientId,
    googleClientSecret,
  })

  return betterAuth(config)
}

// Default export for Better Auth CLI
export default betterAuth(
  createBetterAuthConfig({
    secret: 'placeholder-secret-for-cli-generation',
    baseURL: 'http://localhost:5173',
    db: {} as unknown, // Placeholder for CLI
  })
)

export type Auth = Awaited<ReturnType<typeof createAuth>>

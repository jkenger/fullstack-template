import { createAuthClient } from 'better-auth/react'
import { customSessionClient } from 'better-auth/client/plugins'
import type auth from 'worker/lib/auth'

export const authClient = createAuthClient({
  // Base URL will be the same domain for our setup
  baseURL: import.meta.env.VITE_AUTH_URL || window.location.origin,
  plugins: [customSessionClient<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession, getSession, updateUser } =
  authClient

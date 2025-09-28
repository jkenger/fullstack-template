import { useSession, signOut } from '@/lib/auth-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

// Primary auth hook - uses Better Auth session as single source of truth
export function useAuth() {
  const { data: session, isPending, error } = useSession()

  return {
    ...session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
  }
}

export function useAuthMutations() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logout = useMutation({
    mutationFn: async () => {
      await signOut()
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()

      // Show success message
      toast('Signed out successfully', {
        description: 'You have been signed out of your account.',
      })

      // Redirect to home page
      navigate({ to: '/' })
    },
    onError: error => {
      toast.error('Sign out failed', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      })
    },
  })

  return {
    logout,
  }
}

// Hook to check if user has specific role
// export function usePermissions() {
// const { user } = useAuth()

// const hasRole = (role: string) => {
//   return user?.role === role
// }

// const isAdmin = () => hasRole('admin')
// const isModerator = () => hasRole('moderator')

// return {
//   hasRole,
//   isAdmin,
//   isModerator,
//   userRole: user?.role,
// }
// }

// Hook to protect routes that require authentication
// export function useRequireAuth() {
//   const { isAuthenticated, isLoading } = useAuth()
//   const navigate = useNavigate()

//   if (!isLoading && !isAuthenticated) {
//     navigate({
//       to: '/auth',
//       search: { redirect: window.location.pathname },
//     })
//   }

//   return { isAuthenticated, isLoading }
// }

// // Hook to protect routes that require specific roles
// export function useRequireRole(requiredRole: string) {
//   const { user, isLoading } = useAuth()
//   const { hasRole } = usePermissions()
//   const navigate = useNavigate()

//   if (!isLoading && (!user || !hasRole(requiredRole))) {
//     navigate({ to: '/' })
//     toast.error('Access denied', {
//       description: `This page requires ${requiredRole} permissions.`,
//     })
//   }

//   return { hasPermission: hasRole(requiredRole), isLoading }
// }

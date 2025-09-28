import { client } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'

// Hook to fetch fresh user data from database (use sparingly)
// Primary user data should come from useAuth() which uses Better Auth session
export function useFreshUserData() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['user', 'fresh'],
    queryFn: async () => {
      const res = await client.api.users.me.$get()
      console.log(res)
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user profile')
      }

      return data
    },
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: async (data: {
      name?: string
      bio?: string
      avatar?: string
      image?: string
    }) => {
      const res = await client.api.users.me.$put({ json: data })
      const result = await res.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }

      return result
    },
    onSuccess: () => {
      // Invalidate both Better Auth session and fresh user data
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['$auth'] }) // Better Auth session key
    },
  })

  return {
    updateProfile,
  }
}

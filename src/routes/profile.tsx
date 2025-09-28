import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useFreshUserData, useUserMutations } from '../hooks/useUser'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading'
import { User, Mail, Calendar, Edit3, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { ErrorTester } from '@/components/ErrorTester'

export const Route = createFileRoute('/profile')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/auth',
        search: { redirect: location.href }, // Redirect back after login
      })
    }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', bio: '', image: '' })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: userResponse, isLoading, error } = useFreshUserData()
  const { updateProfile } = useUserMutations()
  const user = userResponse?.data

  const handleStartEdit = () => {
    if (user) {
      setEditData({
        name: user.name || '',
        bio: user.bio || '',
        image: user.image || '',
      })
      setIsEditing(true)
      setErrorMessage(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({ name: '', bio: '', image: '' })
    setErrorMessage(null)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updateData: { name?: string; bio?: string; image?: string } = {}

      if (editData.name.trim() !== user?.name) {
        updateData.name = editData.name.trim()
      }
      if (editData.bio !== (user?.bio || '')) {
        updateData.bio = editData.bio
      }
      if (editData.image !== (user?.image || '')) {
        updateData.image = editData.image || undefined
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile.mutateAsync(updateData)
        toast.success('Profile updated successfully!', {
          description: 'Your changes have been saved.',
        })
      } else {
        toast.info('No changes to save', {
          description: 'Your profile is already up to date.',
        })
      }

      setIsEditing(false)
      setErrorMessage(null)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to update profile'
      setErrorMessage(errorMsg)
      toast.error('Failed to update profile', {
        description: errorMsg,
      })
      console.error('Failed to update profile:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <LoadingPage text="Loading profile..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-destructive">Error: {error.message}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!userResponse?.success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-destructive">
                Error: {userResponse?.error}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="text-destructive">No user data found</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">
              Demo of type-safe API integration with user data management
            </p>
          </div>

          {errorMessage && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <div className="text-destructive text-sm">{errorMessage}</div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>
                Manage your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* image Section */}
              <div className="flex items-center space-x-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-1" />
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user.bio || 'No bio provided yet.'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Member since</Label>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={editData.name}
                      onChange={e =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={editData.bio}
                      onChange={e =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">image URL</Label>
                    <Input
                      id="image"
                      type="url"
                      value={editData.image}
                      onChange={e =>
                        setEditData({ ...editData, image: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="flex-1"
                    >
                      {updateProfile.isPending ? (
                        <LoadingSpinner className="mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Error Boundary Tester - Only show in development */}
          {import.meta.env.DEV && <ErrorTester />}

          {/* API Demo Info */}
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm">API Integration Demo</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                This page demonstrates the type-safe API integration between the
                React frontend and Hono backend using TanStack Query for state
                management.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time data fetching with automatic caching</li>
                <li>Optimistic updates for better UX</li>
                <li>Error handling and loading states</li>
                <li>Type-safe API calls with Hono RPC client</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

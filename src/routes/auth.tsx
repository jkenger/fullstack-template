import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/components/auth/AuthForm'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  return <AuthForm />
}
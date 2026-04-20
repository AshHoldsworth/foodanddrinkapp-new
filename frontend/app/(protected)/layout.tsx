import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { ProtectedShellClient } from './ProtectedShellClient'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session.isAuthenticated) {
    redirect('/')
  }

  return <ProtectedShellClient role={session.role}>{children}</ProtectedShellClient>
}

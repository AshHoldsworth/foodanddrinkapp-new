import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { ProtectedShellClient } from './ProtectedShellClient'
import { USER_TYPES } from '@/constants/userTypes'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session.isAuthenticated) {
    redirect('/')
  }

  if (session.role !== USER_TYPES.Admin && !session.groupId) {
    redirect('/no-group')
  }

  return <ProtectedShellClient role={session.role}>{children}</ProtectedShellClient>
}

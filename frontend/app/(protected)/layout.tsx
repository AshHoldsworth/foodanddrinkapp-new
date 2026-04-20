import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { AppShellClient } from './AppShellClient'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session.isAuthenticated) {
    redirect('/')
  }

  return <AppShellClient role={session.role}>{children}</AppShellClient>
}

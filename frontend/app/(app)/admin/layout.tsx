import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session.isAuthenticated) {
    redirect('/')
  }

  if (session.role !== 'admin') {
    redirect('/meal')
  }

  return <>{children}</>
}

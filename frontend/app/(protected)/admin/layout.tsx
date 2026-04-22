import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { USER_TYPES } from '@/constants/userTypes'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session.isAuthenticated) {
    redirect('/')
  }

  if (session.role !== USER_TYPES.Admin) {
    redirect('/meal')
  }

  return <>{children}</>
}

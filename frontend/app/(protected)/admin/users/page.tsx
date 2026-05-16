import { getAuthSession } from '@/lib/auth'
import AdminUsersPageClient from './AdminUsersPageClient'

const AdminUsersPage = async () => {
  const session = await getAuthSession()

  return <AdminUsersPageClient currentUserId={session.userId} />
}

export default AdminUsersPage

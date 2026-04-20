import { getAuthSession } from '@/lib/auth'
import AdminUsersPageClient from './AdminUsersPageClient'

const AdminUsersPage = async () => {
  const session = await getAuthSession()
  const currentUserId = typeof session.payload?.sub === 'string' ? session.payload.sub : null

  return <AdminUsersPageClient currentUserId={currentUserId} />
}

export default AdminUsersPage

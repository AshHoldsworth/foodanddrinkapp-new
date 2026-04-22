import { redirect } from 'next/navigation'
import { LoginPageClient } from '@/components/home/LoginPageClient'
import { getAuthSession } from '@/lib/auth'
import { USER_TYPES } from '@/constants'

const Home = async () => {
  const session = await getAuthSession()

  if (session.isAuthenticated) {
    if (session.role !== USER_TYPES.Admin && !session.groupId) {
      redirect('/no-group')
    }

    redirect('/meal')
  }

  return <LoginPageClient />
}

export default Home

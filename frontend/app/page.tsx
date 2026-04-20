import { redirect } from 'next/navigation'
import { LoginPageClient } from '@/components/home/LoginPageClient'
import { getAuthSession } from '@/lib/auth'

const Home = async () => {
  const session = await getAuthSession()

  if (session.isAuthenticated) {
    redirect('/meal')
  }

  return <LoginPageClient />
}

export default Home

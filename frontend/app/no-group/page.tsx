import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { USER_TYPES } from '@/constants/userTypes'

const NoGroupPage = async () => {
  const session = await getAuthSession()

  if (session.isAuthenticated && (session.role === USER_TYPES.Admin || session.groupId)) {
    redirect('/meal')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <section className="w-full max-w-lg border border-base-300 rounded-lg p-6 bg-info-content text-base-100 shadow-sm">
        <h1 className="text-2xl font-semibold mb-3">No User Group Assigned</h1>
        <p className="opacity-90 mb-5">
          Your account is not assigned to a user group yet. Please contact an admin to be added to a
          group before using the app.
        </p>
        <Link href="/" className="btn btn-success">
          Back to Login
        </Link>
      </section>
    </main>
  )
}

export default NoGroupPage

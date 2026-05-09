import { headers } from 'next/headers'
import { USER_TYPES, UserRole } from '@/constants'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5237'
const AUTHENTIK_USERNAME_HEADER = 'x-authentik-username'
const API_AUTHENTIK_USERNAME_HEADER = 'X-authentik-username'

export type AuthSession = {
  isAuthenticated: boolean
  role: UserRole
  groupId: string | null
  userId: string | null
}

type MeResponse = {
  data?: { id: string; username: string; role: string; groupId: string | null }
}

export const getAuthSession = async (): Promise<AuthSession> => {
  const unauthenticated: AuthSession = {
    isAuthenticated: false,
    role: USER_TYPES.User,
    groupId: null,
    userId: null,
  }

  const headersList = await headers()
  const headerUsername =
    headersList.get(AUTHENTIK_USERNAME_HEADER) ??
    Array.from(headersList.entries()).find(
      ([key]) => key.toLowerCase() === AUTHENTIK_USERNAME_HEADER,
    )?.[1]
  const devUsername =
    process.env.NODE_ENV === 'development'
      ? (process.env.NEXT_PUBLIC_DEV_USERNAME ?? 'admin')
      : null
  const username = (headerUsername ?? devUsername)?.trim()

  if (!username) {
    return unauthenticated
  }

  try {
    const requestHeaders = new Headers()
    requestHeaders.set(API_AUTHENTIK_USERNAME_HEADER, username)

    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: requestHeaders,
      cache: 'no-store',
    })

    if (!response.ok) {
      return unauthenticated
    }

    const json = (await response.json()) as MeResponse
    const userData = json.data

    if (!userData) {
      return unauthenticated
    }

    const role: UserRole = userData.role === USER_TYPES.Admin ? USER_TYPES.Admin : USER_TYPES.User

    return {
      isAuthenticated: true,
      role,
      groupId: userData.groupId ?? null,
      userId: userData.id,
    }
  } catch {
    return unauthenticated
  }
}

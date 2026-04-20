import { cookies } from 'next/headers'
import { jwtVerify, JWTPayload } from 'jose'

const AUTH_COOKIE = 'fd_auth_token'
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me-32chars!'

export type UserRole = 'admin' | 'user'

export type AuthSession = {
  isAuthenticated: boolean
  role: UserRole
  payload: JWTPayload | null
}

const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch {
    return null
  }
}

export const getAuthSession = async (): Promise<AuthSession> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  const payload = token ? await verifyToken(token) : null
  const role: UserRole = payload?.role === 'admin' ? 'admin' : 'user'

  return {
    isAuthenticated: Boolean(payload),
    role,
    payload,
  }
}

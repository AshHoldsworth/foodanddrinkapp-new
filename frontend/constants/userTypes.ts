export const USER_TYPES = {
  Admin: 'admin',
  User: 'user',
} as const

export const USER_TYPE_OPTIONS = Object.entries(USER_TYPES).map(([key, value]) => ({
  label: key,
  value,
}))

export type UserRole = 'admin' | 'user'

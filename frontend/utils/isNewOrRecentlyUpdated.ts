type DateInput = Date | string | null | undefined

const toValidDate = (value: DateInput): Date | null => {
  if (!value) return null

  const parsed = value instanceof Date ? value : new Date(value)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const isNewOrRecentlyUpdated = (createdAt: DateInput, updatedAt: DateInput): boolean => {
  const createdDate = toValidDate(createdAt)
  if (!createdDate) return false

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
  const threshold = Date.now() - ONE_WEEK_MS

  if (createdDate.getTime() > threshold) return true

  const updatedDate = toValidDate(updatedAt)
  return updatedDate ? updatedDate.getTime() > threshold : false
}

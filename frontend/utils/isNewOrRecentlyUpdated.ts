export type DateInput = Date | string | null | undefined

const toValidDate = (value: DateInput): Date | null => {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const checkDateAgainstThreshold = (date: DateInput, thresholdMs: number): boolean => {
  const validDate = toValidDate(date)
  if (!validDate) return false
  const threshold = Date.now() - thresholdMs
  return validDate.getTime() > threshold
}

export const isNewOrRecentlyUpdated = (
  createdAt: DateInput,
  updatedAt: DateInput,
): { isNew: boolean; isRecentlyUpdated: boolean } => {
  const threshold = 7 * 24 * 60 * 60 * 1000
  return {
    isNew: checkDateAgainstThreshold(createdAt, threshold),
    isRecentlyUpdated: checkDateAgainstThreshold(updatedAt, threshold),
  }
}

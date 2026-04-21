import { AlertProps } from '@/components/Alert'

const PENDING_ALERT_KEY = 'pending-alert'

type PendingAlert = Pick<AlertProps, 'message' | 'type'>

export const savePendingAlert = (alert: PendingAlert) => {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(PENDING_ALERT_KEY, JSON.stringify(alert))
}

export const consumePendingAlert = (): PendingAlert | null => {
  if (typeof window === 'undefined') return null

  const value = window.sessionStorage.getItem(PENDING_ALERT_KEY)
  if (!value) return null

  window.sessionStorage.removeItem(PENDING_ALERT_KEY)

  try {
    return JSON.parse(value) as PendingAlert
  } catch {
    return null
  }
}

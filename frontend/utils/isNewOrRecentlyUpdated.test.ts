import { describe, expect, it, vi } from 'vitest'
import { isNewOrRecentlyUpdated } from './isNewOrRecentlyUpdated'

describe('isNewOrRecentlyUpdated', () => {
  const now = new Date('2026-04-15T12:00:00.000Z')

  it('returns true when created within one week', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const createdAt = new Date('2026-04-10T12:00:00.000Z')
    const updatedAt = null

    expect(isNewOrRecentlyUpdated(createdAt, updatedAt)).toBe(true)

    vi.useRealTimers()
  })

  it('returns true when updated within one week even if created earlier', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const createdAt = new Date('2026-03-20T12:00:00.000Z')
    const updatedAt = new Date('2026-04-12T12:00:00.000Z')

    expect(isNewOrRecentlyUpdated(createdAt, updatedAt)).toBe(true)

    vi.useRealTimers()
  })

  it('returns false when both created and updated are older than one week', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const createdAt = new Date('2026-03-20T12:00:00.000Z')
    const updatedAt = new Date('2026-04-01T12:00:00.000Z')

    expect(isNewOrRecentlyUpdated(createdAt, updatedAt)).toBe(false)

    vi.useRealTimers()
  })

  it('supports ISO date strings from API payloads', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const createdAt = '2026-04-10T12:00:00.000Z'
    const updatedAt = null

    expect(isNewOrRecentlyUpdated(createdAt, updatedAt)).toBe(true)

    vi.useRealTimers()
  })

  it('returns false for invalid created date values', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)

    expect(isNewOrRecentlyUpdated('not-a-date', '2026-04-14T12:00:00.000Z')).toBe(false)

    vi.useRealTimers()
  })
})

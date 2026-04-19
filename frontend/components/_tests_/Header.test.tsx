import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from '@/components/Header'
import { navigation } from '@/constants'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Header', () => {
  it('hides admin navigation for non-admin users', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { role: 'user' } }),
    } as Response)

    render(<Header />)

    expect(screen.getByText('Food & Drink App')).toBeInTheDocument()

    for (const navItem of navigation.filter((item) => !item.requiresAdmin)) {
      expect(screen.getAllByText(navItem.title).length).toBeGreaterThan(0)
    }

    await waitFor(() => {
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })
  })

  it('shows admin navigation for admins', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { role: 'admin' } }),
    } as Response)

    render(<Header />)

    await waitFor(() => {
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0)
    })
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPageClient } from '@/components/home/LoginPageClient'

const replaceMock = vi.fn()
const refreshMock = vi.fn()
const apiPostJsonMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}))

vi.mock('@/app/api/webApi', () => ({
  apiPostJson: (...args: unknown[]) => apiPostJsonMock(...args),
}))

describe('LoginPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an alert when login fails', async () => {
    apiPostJsonMock.mockResolvedValue({ status: 401, errorMessage: 'Bad credentials' })

    render(<LoginPageClient />)

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ash' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Bad credentials')
    })
  })

  it('redirects when login succeeds', async () => {
    apiPostJsonMock.mockResolvedValue({ status: 200, errorMessage: null })

    render(<LoginPageClient />)

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ash' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/meal')
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})

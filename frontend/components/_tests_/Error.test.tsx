import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Error } from '@/components/Error'

describe('Error', () => {
  it('renders title/message and optional retry button', () => {
    const onRetry = vi.fn()

    render(<Error title="Oops" message="Try again" onRetry={onRetry} />)

    expect(screen.getByText('Oops')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

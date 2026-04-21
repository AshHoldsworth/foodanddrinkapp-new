import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '@/components/Alert'

describe('Alert', () => {
  it('renders message and handles close', () => {
    const onCloseClick = vi.fn()

    render(<Alert type="warning" message="Something happened" onCloseClick={onCloseClick} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something happened')

    const closeIcon = screen.getByRole('alert').querySelector('svg:last-child') as SVGElement
    fireEvent.click(closeIcon)

    expect(onCloseClick).toHaveBeenCalledTimes(1)
  })

  it('auto closes after 3 seconds', () => {
    vi.useFakeTimers()
    const onCloseClick = vi.fn()

    render(<Alert type="success" message="Saved" onCloseClick={onCloseClick} />)

    vi.advanceTimersByTime(2999)
    expect(onCloseClick).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onCloseClick).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

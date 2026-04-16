import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from '@/components/errors/Alert'

describe('Alert', () => {
  it('renders message and handles close', () => {
    const onCloseClick = vi.fn()

    render(<Alert type="warning" message="Something happened" onCloseClick={onCloseClick} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something happened')

    const closeIcon = screen.getByRole('alert').querySelector('svg:last-child') as SVGElement
    fireEvent.click(closeIcon)

    expect(onCloseClick).toHaveBeenCalledTimes(1)
  })
})

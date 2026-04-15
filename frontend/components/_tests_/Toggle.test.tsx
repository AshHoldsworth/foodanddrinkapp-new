import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Toggle } from '@/components/Toggle'

describe('Toggle', () => {
  it('calls onChange when toggled', () => {
    const onChange = vi.fn()

    render(<Toggle label="Healthy" checked={false} onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

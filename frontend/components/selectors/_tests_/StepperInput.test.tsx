import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepperInput } from '@/components/selectors/StepperInput'

describe('StepperInput', () => {
  it('increments and decrements within bounds', () => {
    const onChange = vi.fn()

    render(<StepperInput value={3} min={0} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: '-' }))

    expect(onChange).toHaveBeenNthCalledWith(1, 4)
    expect(onChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('disables decrement button at minimum value', () => {
    render(<StepperInput value={0} min={0} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '-' })).toBeDisabled()
  })
})

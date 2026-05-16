import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StepperInput } from '@/components/selectors/StepperInput'

describe('StepperInput', () => {
  it('increments and decrements within bounds', () => {
    const onChange = vi.fn()

    render(<StepperInput id="test-stepper" value={3} min={0} onChange={onChange} />)

    const decrementButton = screen.getByTestId('decrement-button-test-stepper')
    const incrementButton = screen.getByTestId('increment-button-test-stepper')

    fireEvent.click(incrementButton)
    fireEvent.click(decrementButton)

    expect(onChange).toHaveBeenNthCalledWith(1, 4)
    expect(onChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('disables decrement button at minimum value', () => {
    render(<StepperInput id="test-stepper" value={0} min={0} onChange={vi.fn()} />)

    const decrementButton = screen.getByTestId('decrement-button-test-stepper')

    expect(decrementButton).toBeDisabled()
  })
})

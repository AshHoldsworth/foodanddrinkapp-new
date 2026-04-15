import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RangeSelector } from '@/components/RangeSelector'

describe('RangeSelector', () => {
  it('calls onChange with numeric value', () => {
    const onChange = vi.fn()

    render(
      <RangeSelector
        label="Rating"
        min={1}
        max={10}
        step={1}
        value={5}
        onChange={onChange}
        options={['1', '5', '10']}
      />,
    )

    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } })

    expect(onChange).toHaveBeenCalledWith(8)
  })
})

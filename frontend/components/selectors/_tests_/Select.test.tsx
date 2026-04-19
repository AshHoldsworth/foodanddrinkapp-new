import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from '@/components/selectors/Select'
import { COST_OPTIONS } from '@/constants'

describe('Select', () => {
  it('calls onChange with selected value and correct label', () => {
    const onChange = vi.fn()

    render(
      <Select
        label="Test"
        defaultValue="1"
        options={COST_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })

    expect(onChange).toHaveBeenCalledWith('1')
    expect(screen.getByText('Test')).toBeTruthy()
  })
})

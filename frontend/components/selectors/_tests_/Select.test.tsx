import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from '@/components/selectors/Select'
import { COST_OPTIONS } from '@/constants'

describe('Select', () => {
  it('calls onChange with selected value', () => {
    const onChange = vi.fn()

    render(
      <Select
        defaultValue="Cheap"
        options={COST_OPTIONS.map((opt) => opt.label)}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Cheap' } })

    expect(onChange).toHaveBeenCalledWith('Cheap')
  })
})

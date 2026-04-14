import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

describe('Select', () => {
  it('calls onChange with selected value', () => {
    const onChange = vi.fn()

    render(
      <Select
        defaultValue="Moderate"
        options={['Cheap', 'Moderate', 'Expensive']}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Cheap' } })

    expect(onChange).toHaveBeenCalledWith('Cheap')
  })
})

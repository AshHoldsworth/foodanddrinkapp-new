import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from '@/components/selectors/Select'

describe('Select', () => {
  it('calls onChange with selected value and correct label', () => {
    const onChange = vi.fn()

    render(
      <Select
        label="Test"
        defaultValue="1"
        options={[
          { label: 'Low', value: '1' },
          { label: 'High', value: '2' },
        ]}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })

    expect(onChange).toHaveBeenCalledWith('1')
    expect(screen.getByText('Test')).toBeTruthy()
  })
})

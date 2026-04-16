import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchBox } from '@/components/selectors/SearchBox'

describe('SearchBox', () => {
  it('handles search changes and clear action', () => {
    const onSearchChange = vi.fn()
    const onClear = vi.fn()

    const { container } = render(
      <SearchBox onSearchChange={onSearchChange} searchInput="chi" onClear={onClear} />,
    )

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'chicken' } })
    expect(onSearchChange).toHaveBeenCalledTimes(1)

    const clearIcon = container.querySelector('svg') as SVGElement
    fireEvent.click(clearIcon)
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

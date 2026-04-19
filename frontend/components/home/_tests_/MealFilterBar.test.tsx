import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MealFilterBar } from '@/components/home/MealFilterBar'

describe('MealFilterBar', () => {
  it('wires filter controls and apply action', () => {
    const onApplyFilters = vi.fn()

    render(
      <MealFilterBar
        onApplyFilters={onApplyFilters}
        onHealthyToggleChange={vi.fn()}
        healthyToggleState={false}
        onNewOrUpdatedToggleChange={vi.fn()}
        newOrUpdatedToggleState={false}
        onCostChange={vi.fn()}
        cost={3}
        onRatingChange={vi.fn()}
        rating={10}
        onSpeedChange={vi.fn()}
        speed={3}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Apply Filters' })[0])

    expect(onApplyFilters).toHaveBeenCalledTimes(1)
  })
})

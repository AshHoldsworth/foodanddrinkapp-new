import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FloatingActionButton } from './FloatingActionButton'

describe('FloatingActionButton', () => {
  it('invokes action callbacks', () => {
    const onFoodClick = vi.fn()
    const onDrinkClick = vi.fn()
    const onIngredientClick = vi.fn()

    render(
      <FloatingActionButton
        onFoodClick={onFoodClick}
        onDrinkClick={onDrinkClick}
        onIngredientClick={onIngredientClick}
      />,
    )

    fireEvent.click(screen.getByText('Add Food'))
    fireEvent.click(screen.getByText('Add Drink'))
    fireEvent.click(screen.getByText('Add Ingredient'))

    expect(onFoodClick).toHaveBeenCalledTimes(1)
    expect(onDrinkClick).toHaveBeenCalledTimes(1)
    expect(onIngredientClick).toHaveBeenCalledTimes(1)
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FoodCardDisplay } from './FoodCardDisplay'

vi.mock('./FoodCard', () => ({
  FoodCard: ({ food }: { food: { name: string } }) => <div>{food.name}</div>,
}))

describe('FoodCardDisplay', () => {
  it('renders empty state when no items', () => {
    render(<FoodCardDisplay foodItems={[]} setAlertProps={vi.fn()} onEdit={vi.fn()} />)

    expect(screen.getByText('No food items')).toBeInTheDocument()
  })

  it('renders cards when items are present', () => {
    render(
      <FoodCardDisplay
        setAlertProps={vi.fn()}
        onEdit={vi.fn()}
        foodItems={[
          {
            id: '1',
            name: 'Soup',
            imagePath: null,
            rating: 7,
            isHealthyOption: true,
            cost: 2,
            course: 'Lunch',
            difficulty: 1,
            speed: 2,
            ingredients: [],
            createdAt: new Date(),
            updatedAt: null,
          },
        ]}
      />,
    )

    expect(screen.getByText('Soup')).toBeInTheDocument()
  })
})

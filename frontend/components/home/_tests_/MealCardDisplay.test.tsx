import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MealCardDisplay } from '@/components/MealCardDisplay'

vi.mock('@/components/cards/MealCard', () => ({
  MealCard: ({ meal }: { meal: { name: string } }) => <div>{meal.name}</div>,
}))

describe('MealCardDisplay', () => {
  it('renders empty state when no items', () => {
    render(
      <MealCardDisplay
        mealItems={[]}
        setAlertProps={vi.fn()}
        onEdit={vi.fn()}
        onDeleteSuccess={vi.fn()}
      />,
    )

    expect(screen.getByText('No Meals found.')).toBeInTheDocument()
  })

  it('renders cards when items are present', () => {
    render(
      <MealCardDisplay
        setAlertProps={vi.fn()}
        onEdit={vi.fn()}
        onDeleteSuccess={vi.fn()}
        mealItems={[
          {
            id: '1',
            name: 'Soup',
            imagePath: null,
            isHealthyOption: true,
            course: 'Lunch',
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

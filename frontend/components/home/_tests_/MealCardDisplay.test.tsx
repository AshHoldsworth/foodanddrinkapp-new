import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MealCardDisplay } from '@/components/home/MealCardDisplay'

vi.mock('@/components/home/MealCard', () => ({
  MealCard: ({ meal }: { meal: { name: string } }) => <div>{meal.name}</div>,
}))

describe('MealCardDisplay', () => {
  it('renders empty state when no items', () => {
    render(<MealCardDisplay mealItems={[]} setAlertProps={vi.fn()} onEdit={vi.fn()} />)

    expect(screen.getByText('No meal items')).toBeInTheDocument()
  })

  it('renders cards when items are present', () => {
    render(
      <MealCardDisplay
        setAlertProps={vi.fn()}
        onEdit={vi.fn()}
        mealItems={[
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

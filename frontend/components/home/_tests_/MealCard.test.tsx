import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MealCard } from '@/components/home/MealCard'
import { HEALTHY_CHOICE_LABEL } from '@/constants'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

vi.mock('@/app/api/mealsApi', () => ({
  deleteMeal: vi.fn().mockResolvedValue({ status: 200, errorMessage: null }),
}))

describe('MealCard', () => {
  it('renders meal card data and opens delete confirm', () => {
    const setAlertProps = vi.fn()
    const onEdit = vi.fn()
    const onOpen = vi.fn()
    const onDeleteSuccess = vi.fn()

    render(
      <MealCard
        meal={{
          id: 'meal-1',
          name: 'Pasta',
          imagePath: null,
          rating: 8,
          isHealthyOption: true,
          cost: 2,
          course: 'Dinner',
          difficulty: 2,
          speed: 2,
          ingredients: [{ name: 'Tomato', macro: 'Carbs' }],
          createdAt: new Date(),
          updatedAt: null,
        }}
        setAlertProps={setAlertProps}
        onEdit={onEdit}
        onOpen={onOpen}
        onDeleteSuccess={onDeleteSuccess}
      />,
    )

    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.getByText(HEALTHY_CHOICE_LABEL)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('Delete Meal')).toBeInTheDocument()
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MealCard } from '@/components/cards/MealCard'
import { HEALTHY_CHOICE_LABEL } from '@/constants'
import { ModalProvider } from '@/contexts/ModalContext'

const deleteMealMock = vi.fn()

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

vi.mock('@/app/api/mealsApi', () => ({
  deleteMeal: (...args: unknown[]) => deleteMealMock(...args),
}))

describe('MealCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    deleteMealMock.mockResolvedValue({ status: 200, errorMessage: null })
  })

  it('renders meal card data and opens delete confirm', () => {
    const setAlertProps = vi.fn()
    const onEdit = vi.fn()
    const onDeleteSuccess = vi.fn()

    render(
      <ModalProvider>
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
          onDeleteSuccess={onDeleteSuccess}
        />
      </ModalProvider>,
    )

    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.getByText(HEALTHY_CHOICE_LABEL)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('Delete Meal')).toBeInTheDocument()
  })

  it('deletes the meal and shows a success alert', async () => {
    const setAlertProps = vi.fn()
    const onEdit = vi.fn()
    const onDeleteSuccess = vi.fn()

    render(
      <ModalProvider>
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
          onDeleteSuccess={onDeleteSuccess}
        />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1])

    await waitFor(() => {
      expect(deleteMealMock).toHaveBeenCalledWith('meal-1')
      expect(onDeleteSuccess).toHaveBeenCalledTimes(1)
      expect(setAlertProps).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', message: 'Meal deleted.' }),
      )
    })
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MealModal } from '@/components/modals/MealModal'

vi.mock('@/app/api/ingredientApi', () => ({
  getIngredientData: vi.fn().mockResolvedValue({ ingredients: [] }),
}))

vi.mock('@/app/api/mealsApi', () => ({
  postNewMeal: vi.fn(),
  updateMeal: vi.fn(),
}))

vi.mock('@/contexts/ModalContext', () => ({
  useModal: () => ({
    isModalOpen: true,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}))

describe('MealModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows warning when name is blank', () => {
    const setOpen = vi.fn()
    const setAlertProps = vi.fn()

    render(<MealModal setOpen={setOpen} setAlertProps={setAlertProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }))

    expect(setAlertProps).toHaveBeenCalledTimes(1)
    const alertArg = setAlertProps.mock.calls[0][0]
    expect(alertArg.type).toBe('warning')
    expect(alertArg.message).toBe('Name cannot be blank')
  })

  it('closes modal when cancel clicked', () => {
    const setOpen = vi.fn()
    const setAlertProps = vi.fn()

    render(<MealModal setOpen={setOpen} setAlertProps={setAlertProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(setOpen).toHaveBeenCalledWith(false)
  })

  it('renders a fixed overlay and backdrop for the modal shell', () => {
    const setOpen = vi.fn()
    const setAlertProps = vi.fn()

    render(<MealModal setOpen={setOpen} setAlertProps={setAlertProps} />)

    expect(screen.getByTestId('meal-modal-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('meal-modal-backdrop')).toBeInTheDocument()
    expect(screen.getByTestId('meal-modal-content')).toBeInTheDocument()
  })
})

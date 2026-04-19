import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AddModal, ModalContents } from '@/components/modals/AddModal'

vi.mock('@/app/api/ingredientApi', () => ({
  getIngredientData: vi.fn().mockResolvedValue({ ingredients: [] }),
  postNewIngredient: vi.fn(),
  updateIngredient: vi.fn(),
}))

vi.mock('@/app/api/mealsApi', () => ({
  postNewMeal: vi.fn(),
  updateMeal: vi.fn(),
}))

vi.mock('@/app/api/drinkApi', () => ({
  postNewDrink: vi.fn(),
  updateDrink: vi.fn(),
}))

describe('AddModal', () => {
  const modalContents: ModalContents = {
    label: 'Meal',
    ingredients: false,
    course: true,
    difficulty: true,
    speed: true,
    macro: false,
    image: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows warning when name is blank', () => {
    const setShowAddModal = vi.fn()
    const setAlertProps = vi.fn()

    render(
      <AddModal
        setShowAddModal={setShowAddModal}
        modalContents={modalContents}
        setAlertProps={setAlertProps}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Meal' }))

    expect(setAlertProps).toHaveBeenCalledTimes(1)
    const alertArg = setAlertProps.mock.calls[0][0]
    expect(alertArg.type).toBe('warning')
    expect(alertArg.message).toBe('Name cannot be blank')
  })

  it('closes modal when close clicked', () => {
    const setShowAddModal = vi.fn()
    const setAlertProps = vi.fn()

    render(
      <AddModal
        setShowAddModal={setShowAddModal}
        modalContents={modalContents}
        setAlertProps={setAlertProps}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(setShowAddModal).toHaveBeenCalledWith(false)
  })
})

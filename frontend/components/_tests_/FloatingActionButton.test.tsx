import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { ModalProvider } from '@/contexts/ModalContext'

vi.mock('@/components/modals/MealModal', () => ({
  MealModal: () => <div>meal-modal</div>,
}))

vi.mock('@/components/modals/IngredientModal', () => ({
  IngredientModal: () => <div>ingredient-modal</div>,
}))

vi.mock('@/components/errors/Alert', () => ({
  Alert: () => <div>alert</div>,
}))

describe('FloatingActionButton', () => {
  it('opens meal modal when add meal clicked', () => {
    render(
      <ModalProvider>
        <FloatingActionButton />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByText('Add Meal'))

    expect(screen.getByText('meal-modal')).toBeInTheDocument()
  })

  it('opens ingredient modal when add ingredient clicked', () => {
    render(
      <ModalProvider>
        <FloatingActionButton />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByText('Add Ingredient'))

    expect(screen.getByText('ingredient-modal')).toBeInTheDocument()
  })
})

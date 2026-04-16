import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FloatingActionButton } from '@/components/FloatingActionButton'

vi.mock('@/components/modals/AddModal', () => ({
  AddModal: ({ modalContents }: { modalContents: { label: string } }) => (
    <div>add-modal-{modalContents.label}</div>
  ),
}))

vi.mock('@/components/errors/Alert', () => ({
  Alert: () => <div>alert</div>,
}))

describe('FloatingActionButton', () => {
  it('opens meal modal when add meal clicked', () => {
    render(<FloatingActionButton />)

    fireEvent.click(screen.getByText('Add Meal'))

    expect(screen.getByText('add-modal-Meal')).toBeInTheDocument()
  })

  it('opens drink modal when add drink clicked', () => {
    render(<FloatingActionButton />)

    fireEvent.click(screen.getByText('Add Drink'))

    expect(screen.getByText('add-modal-Drink')).toBeInTheDocument()
  })

  it('opens ingredient modal when add ingredient clicked', () => {
    render(<FloatingActionButton />)

    fireEvent.click(screen.getByText('Add Ingredient'))

    expect(screen.getByText('add-modal-Ingredient')).toBeInTheDocument()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FloatingActionButton } from './FloatingActionButton'

vi.mock('./AddModal', () => ({
  AddModal: ({ modalContents }: { modalContents: { label: string } }) => (
    <div>add-modal-{modalContents.label}</div>
  ),
}))

vi.mock('./Alert', () => ({
  Alert: () => <div>alert</div>,
}))

describe('FloatingActionButton', () => {
  it('opens food modal when add food clicked', () => {
    render(<FloatingActionButton />)

    fireEvent.click(screen.getByText('Add Food'))

    expect(screen.getByText('add-modal-Food')).toBeInTheDocument()
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

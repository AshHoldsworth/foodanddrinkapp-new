import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ModalProvider, useModal } from '@/contexts/ModalContext'

const ModalConsumer = () => {
  const { openModal, closeModal } = useModal()

  return (
    <div>
      <button type="button" onClick={openModal}>
        Open Modal
      </button>
      <button type="button" onClick={closeModal}>
        Close Modal
      </button>
    </div>
  )
}

describe('ModalContext', () => {
  it('locks and restores body scroll when modal state changes', () => {
    render(
      <ModalProvider>
        <ModalConsumer />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open Modal' }))

    expect(document.body).toHaveClass('modal-open')
    expect(document.documentElement).toHaveClass('modal-open')
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.width).toBe('100%')

    fireEvent.click(screen.getByRole('button', { name: 'Close Modal' }))

    expect(document.body).not.toHaveClass('modal-open')
    expect(document.documentElement).not.toHaveClass('modal-open')
    expect(document.body.style.position).toBe('')
    expect(document.body.style.width).toBe('')
  })
})
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renders with default button type and base class', () => {
    render(<Button>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('btn')
  })

  it('applies variant, tone, size, circle, and extra classes', () => {
    render(
      <Button variant="outline" tone="success" size="sm" circle className="w-full">
        Apply
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Apply' })
    expect(button).toHaveClass('btn')
    expect(button).toHaveClass('btn-outline')
    expect(button).toHaveClass('btn-success')
    expect(button).toHaveClass('btn-sm')
    expect(button).toHaveClass('btn-circle')
    expect(button).toHaveClass('w-full')
  })

  it('renders icons and children in the button', () => {
    render(
      <Button
        startIcon={<span data-testid="start-icon">S</span>}
        endIcon={<span data-testid="end-icon">E</span>}
      >
        Content
      </Button>,
    )

    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })

  it('shows loading spinner and disables button when isLoading is true', () => {
    const onClick = vi.fn()
    const { container } = render(
      <Button isLoading onClick={onClick}>
        Submit
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toBeDisabled()
    expect(container.querySelector('.loading.loading-spinner.loading-md')).toBeTruthy()

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses loading spinner size that matches button size', () => {
    const { container } = render(
      <Button isLoading size="xs">
        Delete
      </Button>,
    )

    expect(container.querySelector('.loading.loading-spinner.loading-xs')).toBeTruthy()
  })

  it('remains disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })
})

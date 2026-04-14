import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FoodCard } from './FoodCard'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/app/api/foodApi', () => ({
  deleteFood: vi.fn().mockResolvedValue({ status: 200, errorMessage: null }),
}))

describe('FoodCard', () => {
  it('renders food card data and opens delete confirm', () => {
    const setAlertProps = vi.fn()

    render(
      <FoodCard
        id="food-1"
        name="Pasta"
        imagePath={null}
        rating={8}
        isHealthyOption={true}
        cost={2}
        course="Dinner"
        difficulty={2}
        speed={2}
        createdAt={new Date()}
        updatedAt={null}
        setAlertProps={setAlertProps}
      />,
    )

    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.getByText('Healthy Choice')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('Delete Food')).toBeInTheDocument()
  })
})

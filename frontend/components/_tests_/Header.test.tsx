import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from '@/components/Header'
import { navigation } from '@/constants/navigation'

describe('Header', () => {
  it('renders navigation links', () => {
    render(<Header />)

    expect(screen.getByText('Food & Drink App')).toBeInTheDocument()

    for (const navItem of navigation) {
      expect(screen.getAllByText(navItem.title).length).toBeGreaterThan(0)
    }
  })
})

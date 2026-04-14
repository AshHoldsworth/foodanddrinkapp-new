import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FoodPage from './FoodPage'

const getFoodDataMock = vi.fn()

vi.mock('@/app/api/foodApi', () => ({
  getFoodData: (...args: unknown[]) => getFoodDataMock(...args),
}))

vi.mock('@/components/home/FoodFilterBar', () => ({
  FoodFilterBar: () => <div>filter-bar</div>,
}))

vi.mock('./FoodCardDisplay', () => ({
  FoodCardDisplay: () => <div>food-card-display</div>,
}))

vi.mock('../FloatingActionButton', () => ({
  FloatingActionButton: () => <div>fab</div>,
}))

vi.mock('../AddModal', () => ({
  AddModal: () => <div>add-modal</div>,
}))

vi.mock('../Alert', () => ({
  Alert: () => <div>alert</div>,
}))

describe('FoodPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders food card display on successful fetch', async () => {
    getFoodDataMock.mockResolvedValue({ foodItems: [], error: null })

    render(<FoodPage />)

    await waitFor(() => {
      expect(screen.getByText('food-card-display')).toBeInTheDocument()
    })
  })

  it('renders error view when fetch fails', async () => {
    getFoodDataMock.mockResolvedValue({ foodItems: null, error: 'fetch failed' })

    render(<FoodPage />)

    await waitFor(() => {
      expect(screen.getByText('fetch failed')).toBeInTheDocument()
    })
  })
})

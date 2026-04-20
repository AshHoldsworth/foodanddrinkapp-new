import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalProvider } from '@/contexts/ModalContext'
import { DockProvider } from '@/contexts/DockContext'
import MealPage from '../page'

const getMealDataMock = vi.fn()

vi.mock('@/app/api/mealsApi', () => ({
  getMealData: (...args: unknown[]) => getMealDataMock(...args),
}))

vi.mock('@/components/home/MealFilterBar', () => ({
  MealFilterBar: () => <div>filter-bar</div>,
}))

vi.mock('@/components/home/MealCardDisplay', () => ({
  MealCardDisplay: () => <div>meal-card-display</div>,
}))

vi.mock('@/components/FloatingActionButton', () => ({
  FloatingActionButton: () => <div>fab</div>,
}))

vi.mock('@/components/modals/AddModal', () => ({
  AddModal: () => <div>add-modal</div>,
}))

vi.mock('@/components/modals/MealDetailsModal', () => ({
  MealDetailsModal: () => <div>meal-details-modal</div>,
}))

vi.mock('@/components/errors/Alert', () => ({
  Alert: () => <div>alert</div>,
}))

describe('MealPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders meal card display on successful fetch', async () => {
    getMealDataMock.mockResolvedValue({ mealItems: [], error: null })

    render(
      <ModalProvider>
        <DockProvider>
          <MealPage />
        </DockProvider>
      </ModalProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('meal-card-display')).toBeInTheDocument()
    })
  })

  it('renders error view when fetch fails', async () => {
    getMealDataMock.mockResolvedValue({ mealItems: null, error: 'fetch failed' })

    render(
      <ModalProvider>
        <DockProvider>
          <MealPage />
        </DockProvider>
      </ModalProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('fetch failed')).toBeInTheDocument()
    })
  })
})

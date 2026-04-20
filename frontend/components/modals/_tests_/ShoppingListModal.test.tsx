import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShoppingListModal } from '@/components/modals/ShoppingListModal'

const getCurrentShoppingListMock = vi.fn()
const getCompletedShoppingListsMock = vi.fn()
const generateShoppingListMock = vi.fn()
const setShoppingListItemPurchasedMock = vi.fn()
const completeShoppingListMock = vi.fn()

vi.mock('@/app/api/shoppingListApi', () => ({
  getCurrentShoppingList: (...args: unknown[]) => getCurrentShoppingListMock(...args),
  getCompletedShoppingLists: (...args: unknown[]) => getCompletedShoppingListsMock(...args),
  generateShoppingList: (...args: unknown[]) => generateShoppingListMock(...args),
  setShoppingListItemPurchased: (...args: unknown[]) => setShoppingListItemPurchasedMock(...args),
  completeShoppingList: (...args: unknown[]) => completeShoppingListMock(...args),
}))

describe('ShoppingListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
    getCompletedShoppingListsMock.mockResolvedValue({ shoppingLists: [], error: null })
    generateShoppingListMock.mockResolvedValue({
      shoppingList: {
        id: 'list-1',
        startDate: '2026-04-20T00:00:00.000Z',
        endDate: '2026-04-27T00:00:00.000Z',
        items: [],
        isCompleted: false,
        completedAt: null,
        createdAt: '2026-04-20T00:00:00.000Z',
        lastModifiedBy: null,
        lastModifiedAt: null,
      },
      error: null,
    })
    setShoppingListItemPurchasedMock.mockResolvedValue({ shoppingList: null, error: null })
    completeShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
  })

  it('generates a shopping list and shows a success alert', async () => {
    render(<ShoppingListModal onClose={vi.fn()} />)

    await waitFor(() => {
      expect(
        screen.getByText('No active shopping list. Choose how many days ahead to plan purchases.'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Generate List' }))

    await waitFor(() => {
      expect(generateShoppingListMock).toHaveBeenCalledWith(7)
      expect(screen.getByRole('alert')).toHaveTextContent('Shopping list generated.')
    })
  })

  it('renders completed shopping lists when toggled', async () => {
    getCompletedShoppingListsMock.mockResolvedValue({
      shoppingLists: [
        {
          id: 'done-1',
          startDate: '2026-04-01T00:00:00.000Z',
          endDate: '2026-04-07T00:00:00.000Z',
          items: [],
          isCompleted: true,
          completedAt: '2026-04-07T00:00:00.000Z',
          createdAt: '2026-04-01T00:00:00.000Z',
          lastModifiedBy: null,
          lastModifiedAt: null,
        },
      ],
      error: null,
    })

    render(<ShoppingListModal onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'View Completed Lists' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'View Completed Lists' }))

    expect(screen.getByRole('button', { name: 'Hide Completed Lists' })).toBeInTheDocument()
    expect(screen.getByText('Items: 0')).toBeInTheDocument()
  })
})

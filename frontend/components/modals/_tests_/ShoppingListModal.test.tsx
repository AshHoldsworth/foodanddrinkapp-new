import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShoppingListModal } from '@/components/modals/ShoppingListModal'

const getAllIngredientsMock = vi.fn()
const getCurrentShoppingListMock = vi.fn()
const getCompletedShoppingListsMock = vi.fn()
const createManualShoppingListMock = vi.fn()
const generateShoppingListMock = vi.fn()
const addItemToShoppingListMock = vi.fn()
const updateShoppingListItemQuantityMock = vi.fn()
const removeItemFromShoppingListMock = vi.fn()
const setShoppingListItemPurchasedMock = vi.fn()
const completeShoppingListMock = vi.fn()

vi.mock('@/app/api/ingredientApi', () => ({
  getAllIngredients: (...args: unknown[]) => getAllIngredientsMock(...args),
}))

vi.mock('@/app/api/shoppingListApi', () => ({
  getCurrentShoppingList: (...args: unknown[]) => getCurrentShoppingListMock(...args),
  getCompletedShoppingLists: (...args: unknown[]) => getCompletedShoppingListsMock(...args),
  createManualShoppingList: (...args: unknown[]) => createManualShoppingListMock(...args),
  generateShoppingList: (...args: unknown[]) => generateShoppingListMock(...args),
  addItemToShoppingList: (...args: unknown[]) => addItemToShoppingListMock(...args),
  updateShoppingListItemQuantity: (...args: unknown[]) =>
    updateShoppingListItemQuantityMock(...args),
  removeItemFromShoppingList: (...args: unknown[]) => removeItemFromShoppingListMock(...args),
  setShoppingListItemPurchased: (...args: unknown[]) => setShoppingListItemPurchasedMock(...args),
  completeShoppingList: (...args: unknown[]) => completeShoppingListMock(...args),
}))

describe('ShoppingListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAllIngredientsMock.mockResolvedValue({ ingredients: [], error: null })
    getCurrentShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
    getCompletedShoppingListsMock.mockResolvedValue({ shoppingLists: [], error: null })
    createManualShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
    generateShoppingListMock.mockResolvedValue({
      shoppingList: {
        id: 'list-1',
        startDate: '2026-04-20T00:00:00.000Z',
        endDate: '2026-04-27T00:00:00.000Z',
        items: [],
        type: 'Generated',
        isCompleted: false,
        completedAt: null,
        completedBy: null,
        createdAt: '2026-04-20T00:00:00.000Z',
        lastModifiedBy: null,
        lastModifiedAt: null,
      },
      error: null,
    })
    addItemToShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
    updateShoppingListItemQuantityMock.mockResolvedValue({ shoppingList: null, error: null })
    removeItemFromShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
    setShoppingListItemPurchasedMock.mockResolvedValue({ shoppingList: null, error: null })
    completeShoppingListMock.mockResolvedValue({ shoppingList: null, error: null })
  })

  it('generates a shopping list and shows a success alert', async () => {
    render(<ShoppingListModal onClose={vi.fn()} />)

    await waitFor(() => {
      expect(
        screen.getByText('No active shopping list. Choose an option below.'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))

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
          type: 'Manual',
          items: [
            {
              ingredientId: 'ingredient-1',
              ingredientName: 'Tomato',
              quantity: 2,
              isPurchased: true,
              purchasedAt: '2026-04-07T00:00:00.000Z',
            },
          ],
          isCompleted: true,
          completedAt: '2026-04-07T00:00:00.000Z',
          completedBy: 'ash',
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
    expect(screen.getByText('Completed by: ash')).toBeInTheDocument()
    expect(screen.getByText('Tomato x2')).toBeInTheDocument()
  })
})

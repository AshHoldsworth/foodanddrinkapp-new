import { ShoppingList } from '@/models'
import { API_BASE_PATH, buildQueryString } from './webApi'

type ApiResponse<T> = {
  data?: T
  errorMessage?: string
  ErrorMessage?: string
}

const parseError = async (res: Response, fallback: string) => {
  const json = (await res.json().catch(() => ({}))) as ApiResponse<unknown>
  return json.errorMessage ?? json.ErrorMessage ?? fallback
}

export const getCurrentShoppingList = async (): Promise<{
  shoppingList: ShoppingList | null
  error: string | null
}> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/current`, {
      cache: 'no-store',
      credentials: 'include',
    })

    if (!res.ok) {
      return { shoppingList: null, error: await parseError(res, 'Failed to load shopping list.') }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList | null>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[getCurrentShoppingList]:', error)
    return { shoppingList: null, error: 'Failed to load shopping list.' }
  }
}

export const getCompletedShoppingLists = async (
  limit = 20,
): Promise<{
  shoppingLists: ShoppingList[]
  error: string | null
}> => {
  try {
    const query = buildQueryString({ limit })
    const res = await fetch(`${API_BASE_PATH}/shopping-list/completed?${query}`, {
      cache: 'no-store',
      credentials: 'include',
    })

    if (!res.ok) {
      return {
        shoppingLists: [],
        error: await parseError(res, 'Failed to load completed shopping lists.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList[]>
    return { shoppingLists: json.data ?? [], error: null }
  } catch (error) {
    console.error('[getCompletedShoppingLists]:', error)
    return { shoppingLists: [], error: 'Failed to load completed shopping lists.' }
  }
}

export const generateShoppingList = async (
  daysAhead: number,
): Promise<{
  shoppingList: ShoppingList | null
  error: string | null
}> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ daysAhead }),
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to generate shopping list.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[generateShoppingList]:', error)
    return { shoppingList: null, error: 'Failed to generate shopping list.' }
  }
}

export const setShoppingListItemPurchased = async (
  shoppingListId: string,
  ingredientId: string,
  isPurchased: boolean,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/item/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ shoppingListId, ingredientId, isPurchased }),
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to update shopping list item.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[setShoppingListItemPurchased]:', error)
    return { shoppingList: null, error: 'Failed to update shopping list item.' }
  }
}

export const completeShoppingList = async (
  shoppingListId: string,
): Promise<{
  shoppingList: ShoppingList | null
  error: string | null
}> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ shoppingListId }),
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to complete shopping list.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[completeShoppingList]:', error)
    return { shoppingList: null, error: 'Failed to complete shopping list.' }
  }
}

export const createManualShoppingList = async (): Promise<{
  shoppingList: ShoppingList | null
  error: string | null
}> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/create-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to create manual shopping list.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[createManualShoppingList]:', error)
    return { shoppingList: null, error: 'Failed to create manual shopping list.' }
  }
}

export const addItemToShoppingList = async (
  shoppingListId: string,
  ingredientId: string,
  ingredientName: string,
  quantity: number,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/item/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ shoppingListId, ingredientId, ingredientName, quantity }),
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to add item to shopping list.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[addItemToShoppingList]:', error)
    return { shoppingList: null, error: 'Failed to add item to shopping list.' }
  }
}

export const updateShoppingListItemQuantity = async (
  shoppingListId: string,
  ingredientId: string,
  quantity: number,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/item/quantity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ shoppingListId, ingredientId, quantity }),
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to update shopping list item quantity.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[updateShoppingListItemQuantity]:', error)
    return { shoppingList: null, error: 'Failed to update shopping list item quantity.' }
  }
}

export const removeItemFromShoppingList = async (
  shoppingListId: string,
  ingredientId: string,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE_PATH}/shopping-list/item/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ shoppingListId, ingredientId }),
    })

    if (!res.ok) {
      return {
        shoppingList: null,
        error: await parseError(res, 'Failed to remove item from shopping list.'),
      }
    }

    const json = (await res.json()) as ApiResponse<ShoppingList>
    return { shoppingList: json.data ?? null, error: null }
  } catch (error) {
    console.error('[removeItemFromShoppingList]:', error)
    return { shoppingList: null, error: 'Failed to remove item from shopping list.' }
  }
}

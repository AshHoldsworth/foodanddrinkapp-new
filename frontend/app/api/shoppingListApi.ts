import { ShoppingList } from '@/models'
import { apiGet, apiPostJsonData, buildQueryString, ReadApiMessages } from './webApi'

const GET_MESSAGES: ReadApiMessages = {
  ErrorMessage: 'Failed to load shopping list.',
  LogLabel: '[getCurrentShoppingList]',
}

export const getCurrentShoppingList = async (): Promise<{
  shoppingList: ShoppingList | null
  error: string | null
}> => {
  const { data, error } = await apiGet<ShoppingList | null>('/shopping-list/current', GET_MESSAGES)
  return { shoppingList: data ?? null, error }
}

export const getCompletedShoppingLists = async (
  limit = 20,
): Promise<{
  shoppingLists: ShoppingList[]
  error: string | null
}> => {
  const query = buildQueryString({ limit })
  const { data, error } = await apiGet<ShoppingList[]>(`/shopping-list/completed?${query}`, {
    ErrorMessage: 'Failed to load completed shopping lists.',
    LogLabel: '[getCompletedShoppingLists]',
  })
  return { shoppingLists: data ?? [], error }
}

export const generateShoppingList = async (
  daysAhead: number,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  const { data, error } = await apiPostJsonData<{ daysAhead: number }, ShoppingList>(
    '/shopping-list/generate',
    { daysAhead },
    'Failed to generate shopping list.',
  )
  return { shoppingList: data, error }
}

export const setShoppingListItemPurchased = async (
  shoppingListId: string,
  ingredientId: string,
  isPurchased: boolean,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  const { data, error } = await apiPostJsonData<
    { shoppingListId: string; ingredientId: string; isPurchased: boolean },
    ShoppingList
  >(
    '/shopping-list/item/purchase',
    { shoppingListId, ingredientId, isPurchased },
    'Failed to update shopping list item.',
  )
  return { shoppingList: data, error }
}

export const completeShoppingList = async (
  shoppingListId: string,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  const { data, error } = await apiPostJsonData<{ shoppingListId: string }, ShoppingList>(
    '/shopping-list/complete',
    { shoppingListId },
    'Failed to complete shopping list.',
  )
  return { shoppingList: data, error }
}

export const createManualShoppingList = async (): Promise<{
  shoppingList: ShoppingList | null
  error: string | null
}> => {
  const { data, error } = await apiPostJsonData<Record<string, never>, ShoppingList>(
    '/shopping-list/create-manual',
    {},
    'Failed to create manual shopping list.',
  )
  return { shoppingList: data, error }
}

export const addItemToShoppingList = async (
  shoppingListId: string,
  ingredientId: string,
  ingredientName: string,
  quantity: number,
  uoM: string,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  const { data, error } = await apiPostJsonData<
    {
      shoppingListId: string
      ingredientId: string
      ingredientName: string
      quantity: number
      uoM: string
    },
    ShoppingList
  >(
    '/shopping-list/item/add',
    { shoppingListId, ingredientId, ingredientName, quantity, uoM },
    'Failed to add item to shopping list.',
  )
  return { shoppingList: data, error }
}

export const updateShoppingListItemQuantity = async (
  shoppingListId: string,
  ingredientId: string,
  quantity: number,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  const { data, error } = await apiPostJsonData<
    { shoppingListId: string; ingredientId: string; quantity: number },
    ShoppingList
  >(
    '/shopping-list/item/quantity',
    { shoppingListId, ingredientId, quantity },
    'Failed to update shopping list item quantity.',
  )
  return { shoppingList: data, error }
}

export const removeItemFromShoppingList = async (
  shoppingListId: string,
  ingredientId: string,
): Promise<{ shoppingList: ShoppingList | null; error: string | null }> => {
  const { data, error } = await apiPostJsonData<
    { shoppingListId: string; ingredientId: string },
    ShoppingList
  >(
    '/shopping-list/item/remove',
    { shoppingListId, ingredientId },
    'Failed to remove item from shopping list.',
  )
  return { shoppingList: data, error }
}

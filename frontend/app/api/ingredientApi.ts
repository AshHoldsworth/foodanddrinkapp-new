import { Ingredient } from '@/models'
import {
  apiDelete,
  apiGet,
  apiPost,
  buildQueryString,
  MutationApiMessages,
  ReadApiMessages,
} from './webApi'

export type NewIngredientRequest = {
  name: string
  rating: Ingredient['rating']
  isHealthyOption: boolean
  cost: Ingredient['cost']
  macro: Ingredient['macro']
  stockQuantity?: number
}

export type UpdateIngredientRequest = NewIngredientRequest & {
  id: string
  barcodes?: string[] | null
}

export type UpdateIngredientStockRequest = {
  id: string
  stockQuantity: number
}

export interface IngredientFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
  macro?: Ingredient['macro']
  inStockOnly?: boolean
}

const toIngredientFormData = (ingredient: NewIngredientRequest | UpdateIngredientRequest) => {
  const formData = new FormData()

  if ('id' in ingredient) {
    formData.append('id', ingredient.id)
  }

  formData.append('name', ingredient.name)
  formData.append('rating', ingredient.rating.toString())
  formData.append('isHealthyOption', ingredient.isHealthyOption.toString())
  formData.append('cost', ingredient.cost.toString())
  formData.append('macro', ingredient.macro)

  if (ingredient.stockQuantity !== undefined) {
    formData.append('stockQuantity', ingredient.stockQuantity.toString())
  }

  if ('barcodes' in ingredient) {
    ingredient.barcodes?.forEach((barcode) => {
      formData.append('barcodes', barcode)
    })
  } else {
    formData.append('createdAt', new Date().toISOString())
  }

  return formData
}

export async function getIngredientData(
  filters: IngredientFilterParams = {},
): Promise<{ ingredients: Ingredient[] | null; error: string | null }> {
  const queryString = buildQueryString({
    search: filters.search,
    isHealthy: filters.isHealthy,
    maxCost: filters.maxCost,
    maxRating: filters.maxRating,
    macro: filters.macro,
    inStockOnly: filters.inStockOnly,
  })

  const messages: ReadApiMessages = {
    ErrorMessage: 'An error occurred while fetching ingredient data',
    LogLabel: 'Error fetching ingredient data',
  }

  const { data, error } = await apiGet<Ingredient[]>(
    `/ingredient/all${queryString ? `?${queryString}` : ''}`,
    messages,
  )

  return { ingredients: data, error }
}

export async function postNewIngredient(ingredient: NewIngredientRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while posting new ingredient',
    FallbackErrorMessage: 'Failed to add ingredient',
    LogLabel: 'Error posting new ingredient',
  }

  return apiPost('/ingredient/add', { body: toIngredientFormData(ingredient) }, messages)
}

export async function updateIngredient(ingredient: UpdateIngredientRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while updating ingredient',
    FallbackErrorMessage: 'Failed to update ingredient',
    LogLabel: 'Error updating ingredient',
  }

  return apiPost('/ingredient/update', { body: toIngredientFormData(ingredient) }, messages)
}

export async function updateIngredientStock(ingredient: UpdateIngredientStockRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while updating ingredient stock quantity',
    FallbackErrorMessage: 'Failed to update ingredient stock quantity',
    LogLabel: 'Error updating ingredient stock quantity',
  }

  const formData = new FormData()
  formData.append('id', ingredient.id)
  formData.append('stockQuantity', ingredient.stockQuantity.toString())

  return apiPost('/ingredient/update', { body: formData }, messages)
}

export async function deleteIngredient(id: string) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while deleting ingredient',
    FallbackErrorMessage: 'Failed to delete ingredient',
    LogLabel: 'Error deleting ingredient',
  }

  return apiDelete('/ingredient/delete', { queryParams: { id } }, messages)
}

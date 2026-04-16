import { Drink } from '@/models'
import {
  apiGet,
  apiPost,
  appendIngredients,
  buildQueryString,
  MutationApiMessages,
  ReadApiMessages,
} from './webApi'

export type NewDrinkRequest = {
  name: string
  rating: Drink['rating']
  isHealthyOption: boolean
  cost: Drink['cost']
  difficulty: Drink['difficulty']
  speed: Drink['speed']
  ingredients: Drink['ingredients']
  imageFile?: File | null
}

export type UpdateDrinkRequest = NewDrinkRequest & {
  id: string
}

export interface DrinkFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
  maxSpeed?: number
  newOrUpdated?: boolean
}

const toDrinkFormData = (drink: NewDrinkRequest | UpdateDrinkRequest) => {
  const formData = new FormData()

  if ('id' in drink) {
    formData.append('id', drink.id)
  }

  formData.append('name', drink.name)
  formData.append('rating', drink.rating.toString())
  formData.append('isHealthyOption', drink.isHealthyOption.toString())
  formData.append('cost', drink.cost.toString())
  formData.append('difficulty', drink.difficulty.toString())
  formData.append('speed', drink.speed.toString())
  appendIngredients(formData, drink.ingredients)

  if (drink.imageFile) {
    formData.append('image', drink.imageFile)
  }

  return formData
}

export async function getDrinkData(
  filters: DrinkFilterParams = {},
): Promise<{ drinks: Drink[] | null; error: string | null }> {
  const queryString = buildQueryString({
    search: filters.search,
    isHealthy: filters.isHealthy,
    maxCost: filters.maxCost,
    maxRating: filters.maxRating,
    maxSpeed: filters.maxSpeed,
    newOrUpdated: filters.newOrUpdated,
  })

  const messages: ReadApiMessages = {
    ErrorMessage: 'An error occurred while fetching drink data',
    LogLabel: 'Error fetching drink data',
  }
  const { data, error } = await apiGet<Drink[]>(
    `/drink/all${queryString ? `?${queryString}` : ''}`,
    messages,
  )

  return { drinks: data, error }
}

export async function postNewDrink(drink: NewDrinkRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while posting new drink',
    FallbackErrorMessage: 'Failed to add drink',
    LogLabel: 'Error posting new drink',
  }
  return apiPost('/drink/add', { body: toDrinkFormData(drink) }, messages)
}

export async function updateDrink(drink: UpdateDrinkRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while updating drink',
    FallbackErrorMessage: 'Failed to update drink',
    LogLabel: 'Error updating drink',
  }
  return apiPost('/drink/update', { body: toDrinkFormData(drink) }, messages)
}

export async function deleteDrink(id: string) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while deleting drink',
    FallbackErrorMessage: 'Failed to delete drink',
    LogLabel: 'Error deleting drink',
  }
  return apiPost('/drink/delete', { queryParams: { id } }, messages)
}

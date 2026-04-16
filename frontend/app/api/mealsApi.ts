import { Meal } from '@/models'
import {
  apiGet,
  apiPost,
  appendIngredients,
  buildQueryString,
  MutationApiMessages,
  ReadApiMessages,
} from './webApi'

export type NewMealRequest = {
  name: string
  rating: Meal['rating']
  isHealthyOption: boolean
  cost: Meal['cost']
  course: Meal['course']
  difficulty: Meal['difficulty']
  speed: Meal['speed']
  ingredients: Meal['ingredients']
  imageFile?: File | null
}

export type UpdateMealRequest = NewMealRequest & {
  id: string
}

export interface MealFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
  maxSpeed?: number
  newOrUpdated?: boolean
}

const toMealFormData = (meal: NewMealRequest | UpdateMealRequest) => {
  const formData = new FormData()

  if ('id' in meal) {
    formData.append('id', meal.id)
  }

  formData.append('name', meal.name)
  formData.append('rating', meal.rating.toString())
  formData.append('isHealthyOption', meal.isHealthyOption.toString())
  formData.append('cost', meal.cost.toString())
  formData.append('course', meal.course)
  formData.append('difficulty', meal.difficulty.toString())
  formData.append('speed', meal.speed.toString())
  appendIngredients(formData, meal.ingredients)

  if (meal.imageFile) {
    formData.append('image', meal.imageFile)
  }

  return formData
}

export async function getMealData(
  filters: MealFilterParams = {},
): Promise<{ mealItems: Meal[] | null; error: string | null }> {
  const queryString = buildQueryString({
    search: filters.search,
    isHealthy: filters.isHealthy,
    maxCost: filters.maxCost,
    maxRating: filters.maxRating,
    maxSpeed: filters.maxSpeed,
    newOrUpdated: filters.newOrUpdated,
  })

  const messages: ReadApiMessages = {
    ErrorMessage: 'An error occurred while fetching meal data',
    LogLabel: 'Error fetching meal data',
  }
  const { data, error } = await apiGet<Meal[]>(
    `/meal/all${queryString ? `?${queryString}` : ''}`,
    messages,
  )

  return { mealItems: data, error }
}

export async function getMealById(
  id: string,
): Promise<{ meal: Meal | null; error: string | null }> {
  const messages: ReadApiMessages = {
    ErrorMessage: 'An error occurred while fetching meal data',
    LogLabel: 'Error fetching meal by id',
  }
  const { data, error } = await apiGet<Meal>(`/meal?id=${encodeURIComponent(id)}`, messages)

  return { meal: data, error }
}

export async function postNewMeal(meal: NewMealRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while posting new meal',
    FallbackErrorMessage: 'Failed to add meal',
    LogLabel: 'Error posting new meal',
  }
  return apiPost('/meal/add', { body: toMealFormData(meal) }, messages)
}

export async function updateMeal(meal: UpdateMealRequest) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while updating meal',
    FallbackErrorMessage: 'Failed to update meal',
    LogLabel: 'Error updating meal',
  }
  return apiPost('/meal/update', { body: toMealFormData(meal) }, messages)
}

export async function deleteMeal(id: string) {
  const messages: MutationApiMessages = {
    ErrorMessage: 'An error occurred while deleting meal',
    FallbackErrorMessage: 'Failed to delete meal',
    LogLabel: 'Error deleting meal',
  }
  return apiPost('/meal/delete', { queryParams: { id } }, messages)
}

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
  isHealthyOption: boolean
  course: Meal['course']
  ingredients: Meal['ingredients']
  imageFile?: File | null
}

export type UpdateMealRequest = NewMealRequest & {
  id: string
}

export interface MealFilterParams {
  search?: string
  isHealthy?: boolean
  newOrUpdated?: boolean
}

const toMealFormData = (meal: NewMealRequest | UpdateMealRequest) => {
  const formData = new FormData()

  if ('id' in meal) {
    formData.append('id', meal.id)
  }

  formData.append('name', meal.name)
  formData.append('isHealthyOption', meal.isHealthyOption.toString())
  formData.append('course', meal.course)
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

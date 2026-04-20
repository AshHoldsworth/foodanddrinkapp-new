import { MealPlan } from '@/models'
import { apiGet, apiPostJson, buildQueryString, ReadApiMessages } from './webApi'

export type SaveMealPlanPayload = {
  weekStart: string
  days: Array<{
    date: string
    lunchMealId: string | null
    dinnerMealId: string | null
  }>
}

export async function getMealPlan(
  weekStart: string,
): Promise<{ plan: MealPlan | null; error: string | null }> {
  const queryString = buildQueryString({ weekStart })

  const messages: ReadApiMessages = {
    ErrorMessage: 'An error occurred while fetching meal plan data',
    LogLabel: 'Error fetching meal plan data',
  }

  const { data, error } = await apiGet<MealPlan>(`/meal/plan?${queryString}`, messages)

  return { plan: data, error }
}

export async function saveMealPlan(payload: SaveMealPlanPayload) {
  return apiPostJson('/meal/plan', payload)
}

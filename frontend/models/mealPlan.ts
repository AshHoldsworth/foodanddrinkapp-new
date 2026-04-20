export type MealPlanDay = {
  date: string
  lunchMealId: string | null
  dinnerMealId: string | null
}

export type MealPlan = {
  id: string
  userId: string
  weekStart: string
  days: MealPlanDay[]
  createdAt: string
  updatedAt: string | null
}
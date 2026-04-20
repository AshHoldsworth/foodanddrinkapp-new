export type MealPlanDay = {
  date: string
  lunchMealId: string | null
  dinnerMealId: string | null
}

export type MealPlan = {
  id: string
  weekStart: string
  days: MealPlanDay[]
  createdAt: string
  lastModifiedBy: string | null
  lastModifiedAt: string | null
}

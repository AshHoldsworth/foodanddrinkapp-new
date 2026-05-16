import { CourseOption } from '@/constants'
import { MealIngredient } from './mealIngredient'

export type Meal = {
  id: string
  name: string
  imagePath?: string | null
  isHealthyOption: boolean
  course: CourseOption
  ingredients: MealIngredient[]
  createdAt: Date
  updatedAt: Date | null
}

import { CourseOption } from '@/constants'
import { Cost, Difficulty, Speed, Rating } from './scales'
import { MealIngredient } from './mealIngredient'

export type Meal = {
  id: string
  name: string
  imagePath?: string | null
  rating: Rating
  isHealthyOption: boolean
  cost: Cost
  course: CourseOption
  difficulty: Difficulty
  speed: Speed
  ingredients: MealIngredient[]
  createdAt: Date
  updatedAt: Date | null
}

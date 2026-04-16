import { CourseOption } from '@/constants'
import { Cost, Difficulty, Speed } from './scales'
import { MealIngredient } from './mealIngredient'
import { Rating } from './rating'

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

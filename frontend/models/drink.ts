import { Rating } from './scales'
import { Cost, Difficulty, Speed } from './scales'
import { MealIngredient } from './mealIngredient'

export type Drink = {
  id: string
  name: string
  imagePath?: string | null
  rating: Rating
  isHealthyOption: boolean
  cost: Cost
  difficulty: Difficulty
  speed: Speed
  ingredients: MealIngredient[]
  createdAt: Date
  updatedAt: Date | null
}

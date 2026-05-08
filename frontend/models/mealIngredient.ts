import { MacroOption } from '@/constants'

export type MealIngredient = {
  ingredientId: string
  name: string
  macro: MacroOption
  preparation?: string | null
  quantity?: number | null
  uoM?: string | null
}

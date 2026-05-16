import { MealIngredient } from '@/models'
import { getMacroOrder } from './macroOrder'

export const orderIngredients = (
  ingredients: MealIngredient[],
): { ingredient: MealIngredient; originalIndex: number }[] => {
  const ordered = ingredients
    .map((ingredient, originalIndex) => ({ ingredient, originalIndex }))
    .sort((a, b) => {
      const macroOrderDifference =
        getMacroOrder(a.ingredient.macro) - getMacroOrder(b.ingredient.macro)
      if (macroOrderDifference !== 0) return macroOrderDifference

      const nameDifference = a.ingredient.name.localeCompare(b.ingredient.name)
      if (nameDifference !== 0) return nameDifference

      return a.originalIndex - b.originalIndex
    })
    .map(({ ingredient }) => ingredient)

  const originalIndex = ordered.map((ingredient) => ingredients.indexOf(ingredient))

  return ordered.map((ingredient, index) => ({ ingredient, originalIndex: originalIndex[index] }))
}

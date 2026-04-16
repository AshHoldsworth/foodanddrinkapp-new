import { Ingredient } from '@/models/ingredient'

export const getMacroBadgeType = (macro?: Ingredient['macro']) => {
  if (macro === 'Protein') return 'success'
  if (macro === 'Carbs') return 'warning'
  if (macro === 'Fat') return 'error'
  if (macro === 'Vegetable') return 'info'
  return 'neutral'
}

export const getMacroBadgeClass = (macro?: Ingredient['macro']) => {
  if (macro === 'Protein') return 'badge-success'
  if (macro === 'Carbs') return 'badge-warning'
  if (macro === 'Fat') return 'badge-error'
  if (macro === 'Vegetable') return 'badge-info'
  return 'badge-neutral'
}

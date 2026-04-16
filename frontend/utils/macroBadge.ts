import { MACRO_BADGE_CLASS } from '@/constants'
import { Ingredient } from '@/models'

export const getMacroBadgeClass = (macro?: Ingredient['macro']) => {
  return macro ? MACRO_BADGE_CLASS[macro] : 'badge-neutral'
}

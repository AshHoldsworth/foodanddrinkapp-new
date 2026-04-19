export type MacroOption = 'Protein' | 'Carbs' | 'Fat' | 'Vegetable'

export const MACRO_OPTIONS = ['Protein', 'Carbs', 'Fat', 'Vegetable'] as const

export const MACRO_ORDER: Record<MacroOption, number> = {
  Protein: 0,
  Carbs: 1,
  Fat: 2,
  Vegetable: 3,
}

export const MACRO_BADGE_COLOUR: Record<MacroOption, string> = {
  Protein: 'badge-info',
  Carbs: 'badge-warning',
  Fat: 'badge-error',
  Vegetable: 'badge-success',
}

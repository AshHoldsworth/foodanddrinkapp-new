export type MacroOption = 'Protein' | 'Carbs' | 'Fat' | 'Vegetable'

export const MACRO_OPTIONS = ['Protein', 'Carbs', 'Fat', 'Vegetable'] as const

export const MACRO_ORDER: Record<MacroOption, number> = {
  Protein: 0,
  Fat: 1,
  Carbs: 2,
  Vegetable: 3,
}

export const MACRO_COLOUR: Record<MacroOption, string> = {
  Protein: 'info',
  Carbs: 'warning',
  Fat: 'error',
  Vegetable: 'success',
}

export const MACRO_BADGE_CLASS: Record<MacroOption, string> = {
  Protein: 'badge-info',
  Carbs: 'badge-warning',
  Fat: 'badge-error',
  Vegetable: 'badge-success',
}

export const MACRO_BG_CLASS: Record<MacroOption, string> = {
  Protein: 'bg-info',
  Carbs: 'bg-warning',
  Fat: 'bg-error',
  Vegetable: 'bg-success',
}


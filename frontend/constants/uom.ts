export const UOM_OPTIONS = ['Portions', 'Grams', 'Kg', 'Ml', 'Litres', 'Tsp', 'Tbsp'] as const

export type UoMOption = (typeof UOM_OPTIONS)[number]

export const DEFAULT_UOM: UoMOption = 'Portions'

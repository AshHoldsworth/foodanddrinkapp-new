export const COST_LABEL_BY_VALUE = {
  1: 'Cheap',
  2: 'Moderate',
  3: 'Expensive',
} as const

export const COST_OPTIONS = Object.entries(COST_LABEL_BY_VALUE).map(([value, label]) => ({
  label,
  value: Number(value),
}))

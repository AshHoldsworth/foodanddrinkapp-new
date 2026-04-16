export const SPEED_LABEL_BY_VALUE = {
  1: 'Slow',
  2: 'Average',
  3: 'Quick',
} as const

export const SPEED_OPTIONS = Object.entries(SPEED_LABEL_BY_VALUE).map(([value, label]) => ({
  label,
  value: Number(value),
}))

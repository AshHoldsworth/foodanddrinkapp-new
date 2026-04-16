export const DIFFICULTY_LABEL_BY_VALUE = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
} as const

export const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABEL_BY_VALUE).map(
  ([value, label]) => ({
    label,
    value: Number(value),
  }),
)

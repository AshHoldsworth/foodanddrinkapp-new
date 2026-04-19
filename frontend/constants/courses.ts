export type CourseOption = 'Breakfast' | 'Lunch' | 'Dinner'

export const COURSE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'] as const

export const COURSE_BADGE_COLOUR: Record<CourseOption, string> = {
  Breakfast: 'badge-info',
  Lunch: 'badge-success',
  Dinner: 'badge-error',
}

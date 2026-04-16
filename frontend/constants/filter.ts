import { HEALTHY_CHOICE_LABEL } from './labels'

export const FILTER_LIMITS = {
  costMin: 1,
  costMax: 3,
  ratingMin: 1,
  ratingMax: 10,
  speedMin: 1,
  speedMax: 3,
} as const

export const FILTER_LABELS = {
  healthyOptions: HEALTHY_CHOICE_LABEL,
  newOrUpdated: 'New / Updated',
  cost: 'Cost',
  rating: 'Rating',
  speed: 'Speed',
  showFilters: 'Show Filters',
  hideFilters: 'Hide Filters',
  applyFilters: 'Apply Filters',
} as const

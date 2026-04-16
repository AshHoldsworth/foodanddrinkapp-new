import { COST_OPTIONS } from './costs'
import { HEALTHY_OPTIONS_LABEL } from './labels'
import { RATING_FILTER_OPTIONS } from './ratings'
import { SPEED_OPTIONS } from './speeds'

export const MEAL_FILTER_LIMITS = {
  costMin: 1,
  costMax: 3,
  ratingMin: 1,
  ratingMax: 10,
  speedMin: 1,
  speedMax: 3,
} as const

export const MEAL_FILTER_OPTIONS = {
  cost: COST_OPTIONS,
  rating: RATING_FILTER_OPTIONS,
  speed: SPEED_OPTIONS,
} as const

export const MEAL_FILTER_LABELS = {
  healthyOptions: HEALTHY_OPTIONS_LABEL,
  newOrUpdated: 'New / Updated',
  cost: 'Cost',
  rating: 'Rating',
  speed: 'Speed',
  showFilters: 'Show Filters',
  hideFilters: 'Hide Filters',
  applyFilters: 'Apply Filters',
} as const

export const MEAL_MODAL_CONTENTS = {
  meal: {
    label: 'Meal',
    ingredients: true,
    course: true,
    difficulty: true,
    speed: true,
    macro: false,
  },
  drink: {
    label: 'Drink',
    ingredients: true,
    course: false,
    difficulty: true,
    speed: true,
    macro: false,
  },
  ingredient: {
    label: 'Ingredient',
    ingredients: false,
    course: false,
    difficulty: false,
    speed: false,
    macro: true,
  },
} as const

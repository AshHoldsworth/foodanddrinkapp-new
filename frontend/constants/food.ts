export const FOOD_FILTER_LIMITS = {
  costMin: 1,
  costMax: 3,
  ratingMin: 1,
  ratingMax: 10,
  speedMin: 1,
  speedMax: 3,
} as const

export const FOOD_FILTER_OPTIONS = {
  cost: ['Cheap', 'Moderate', 'Expensive'],
  rating: ['1', '5', '10'],
  speed: ['Slow', 'Average', 'Fast'],
} as const

export const FOOD_FILTER_LABELS = {
  healthyOptions: 'Healthy Options',
  newOrUpdated: 'New / Updated',
  cost: 'Cost',
  rating: 'Rating',
  speed: 'Speed',
  showFilters: 'Show Filters',
  hideFilters: 'Hide Filters',
  applyFilters: 'Apply Filters',
} as const

export const FOOD_MODAL_CONTENTS = {
  food: {
    label: 'Food',
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

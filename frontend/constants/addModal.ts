export const MODAL_CONTENTS = {
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

export const MEAL_LABEL = MODAL_CONTENTS.meal.label
export const DRINK_LABEL = MODAL_CONTENTS.drink.label
export const INGREDIENT_LABEL = MODAL_CONTENTS.ingredient.label

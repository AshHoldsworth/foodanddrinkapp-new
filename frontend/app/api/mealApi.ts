import { Meal } from '@/models/meal'
import { Ingredient } from '@/models/ingredient'
import { Drink } from '@/models/drink'

const MEAL_API_BASE_PATH = '/backend'

export type NewMealRequest = {
  name: string
  rating: Meal['rating']
  isHealthyOption: boolean
  cost: Meal['cost']
  course: Meal['course']
  difficulty: Meal['difficulty']
  speed: Meal['speed']
  ingredients: Meal['ingredients']
  imageFile?: File | null
}

export type UpdateMealRequest = NewMealRequest & {
  id: string
}

export type NewDrinkRequest = {
  name: string
  rating: Drink['rating']
  isHealthyOption: boolean
  cost: Drink['cost']
  difficulty: Drink['difficulty']
  speed: Drink['speed']
  ingredients: string[]
  imageFile?: File | null
}

export type UpdateDrinkRequest = NewDrinkRequest & {
  id: string
}

export type NewIngredientRequest = {
  name: string
  rating: Ingredient['rating']
  isHealthyOption: boolean
  cost: Ingredient['cost']
  macro: Ingredient['macro']
}

export type UpdateIngredientRequest = NewIngredientRequest & {
  id: string
  barcodes?: string[] | null
}

interface MealFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
  maxSpeed?: number
  newOrUpdated?: boolean
}

interface DrinkFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
  maxSpeed?: number
  newOrUpdated?: boolean
}

interface IngredientFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
}

const buildErrorMessage = async (res: Response, fallback: string) => {
  const message = await res.text()
  return message || fallback
}

const appendList = (formData: FormData, key: string, values: string[]) => {
  values.forEach((value) => {
    formData.append(key, value)
  })
}

const appendMealIngredients = (formData: FormData, ingredients: Meal['ingredients']) => {
  ingredients.forEach((ingredient, index) => {
    formData.append(`ingredients[${index}].name`, ingredient.name)
    if (ingredient.macro) {
      formData.append(`ingredients[${index}].macro`, ingredient.macro)
    }
  })
}

export async function getMealData(
  filters: MealFilterParams = {},
): Promise<{ mealItems: Meal[] | null; error: string | null }> {
  let mealItems: Meal[] | null = null
  let error: string | null = null

  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.isHealthy) params.set('isHealthy', 'true')
  if (filters.maxCost !== undefined) params.set('maxCost', filters.maxCost.toString())
  if (filters.maxRating !== undefined) params.set('maxRating', filters.maxRating.toString())
  if (filters.maxSpeed !== undefined) params.set('maxSpeed', filters.maxSpeed.toString())
  if (filters.newOrUpdated) params.set('newOrUpdated', 'true')

  const queryString = params.toString()
  const url = `${MEAL_API_BASE_PATH}/meal/all${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return { mealItems: null, error: 'An error occurred while fetching meal data' }
    }

    const json = await res.json()
    mealItems = json.data as Meal[]
  } catch (err) {
    console.error('Error fetching meal data:', err)
    error = 'An error occurred while fetching meal data'
  }

  return { mealItems, error }
}

export async function getMealById(
  id: string,
): Promise<{ meal: Meal | null; error: string | null }> {
  let meal: Meal | null = null
  let error: string | null = null

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/meal?id=${id}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return { meal: null, error: 'An error occurred while fetching meal data' }
    }

    const json = await res.json()
    meal = json.data as Meal
  } catch (err) {
    console.error('Error fetching meal by id:', err)
    error = 'An error occurred while fetching meal data'
  }

  return { meal, error }
}

export async function getIngredientData(filters: IngredientFilterParams = {}): Promise<{
  ingredients: Ingredient[] | null
  error: string | null
}> {
  let ingredients: Ingredient[] | null = null
  let error: string | null = null

  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.isHealthy) params.set('isHealthy', 'true')
  if (filters.maxCost !== undefined) params.set('maxCost', filters.maxCost.toString())
  if (filters.maxRating !== undefined) params.set('maxRating', filters.maxRating.toString())

  const queryString = params.toString()
  const url = `${MEAL_API_BASE_PATH}/ingredient/all${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return { ingredients: null, error: 'An error occurred while fetching ingredient data' }
    }

    const json = await res.json()
    ingredients = json.data as Ingredient[]
  } catch (err) {
    console.error('Error fetching ingredient data:', err)
    error = 'An error occurred while fetching ingredient data'
  }

  return { ingredients, error }
}

export async function postNewMeal(
  meal: NewMealRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('name', meal.name)
  formData.append('rating', meal.rating.toString())
  formData.append('isHealthyOption', meal.isHealthyOption.toString())
  formData.append('cost', meal.cost.toString())
  formData.append('course', meal.course)
  formData.append('difficulty', meal.difficulty.toString())
  formData.append('speed', meal.speed.toString())
  appendMealIngredients(formData, meal.ingredients)
  if (meal.imageFile) {
    formData.append('image', meal.imageFile)
  }

  const options = {
    method: 'POST',
    body: formData,
  }

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/meal/add`, options)
    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to add meal')
      return { status: res.status, errorMessage }
    }
    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error posting new meal:', error)
    return { status: 500, errorMessage: 'An error occurred while posting new meal' }
  }
}

export async function updateMeal(
  meal: UpdateMealRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('id', meal.id)
  formData.append('name', meal.name)
  formData.append('rating', meal.rating.toString())
  formData.append('isHealthyOption', meal.isHealthyOption.toString())
  formData.append('cost', meal.cost.toString())
  formData.append('course', meal.course)
  formData.append('difficulty', meal.difficulty.toString())
  formData.append('speed', meal.speed.toString())
  appendMealIngredients(formData, meal.ingredients)
  if (meal.imageFile) {
    formData.append('image', meal.imageFile)
  }

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/meal/update`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to update meal')
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error updating meal:', error)
    return { status: 500, errorMessage: 'An error occurred while updating meal' }
  }
}

export async function getDrinkData(
  filters: DrinkFilterParams = {},
): Promise<{ drinks: Drink[] | null; error: string | null }> {
  let drinks: Drink[] | null = null
  let error: string | null = null

  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.isHealthy) params.set('isHealthy', 'true')
  if (filters.maxCost !== undefined) params.set('maxCost', filters.maxCost.toString())
  if (filters.maxRating !== undefined) params.set('maxRating', filters.maxRating.toString())
  if (filters.maxSpeed !== undefined) params.set('maxSpeed', filters.maxSpeed.toString())
  if (filters.newOrUpdated) params.set('newOrUpdated', 'true')

  const queryString = params.toString()
  const url = `${MEAL_API_BASE_PATH}/drink/all${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, { cache: 'no-store' })

    if (!res.ok) {
      return { drinks: null, error: 'An error occurred while fetching drink data' }
    }

    const json = await res.json()
    drinks = json.data as Drink[]
  } catch (err) {
    console.error('Error fetching drink data:', err)
    error = 'An error occurred while fetching drink data'
  }

  return { drinks, error }
}

export async function postNewDrink(
  drink: NewDrinkRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('name', drink.name)
  formData.append('rating', drink.rating.toString())
  formData.append('isHealthyOption', drink.isHealthyOption.toString())
  formData.append('cost', drink.cost.toString())
  formData.append('difficulty', drink.difficulty.toString())
  formData.append('speed', drink.speed.toString())
  appendList(formData, 'ingredients', drink.ingredients)
  if (drink.imageFile) {
    formData.append('image', drink.imageFile)
  }

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/drink/add`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to add drink')
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error posting new drink:', error)
    return { status: 500, errorMessage: 'An error occurred while posting new drink' }
  }
}

export async function updateDrink(
  drink: UpdateDrinkRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('id', drink.id)
  formData.append('name', drink.name)
  formData.append('rating', drink.rating.toString())
  formData.append('isHealthyOption', drink.isHealthyOption.toString())
  formData.append('cost', drink.cost.toString())
  formData.append('difficulty', drink.difficulty.toString())
  formData.append('speed', drink.speed.toString())
  appendList(formData, 'ingredients', drink.ingredients)
  if (drink.imageFile) {
    formData.append('image', drink.imageFile)
  }

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/drink/update`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to update drink')
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error updating drink:', error)
    return { status: 500, errorMessage: 'An error occurred while updating drink' }
  }
}

export async function postNewIngredient(
  ingredient: NewIngredientRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('name', ingredient.name)
  formData.append('rating', ingredient.rating.toString())
  formData.append('isHealthyOption', ingredient.isHealthyOption.toString())
  formData.append('cost', ingredient.cost.toString())
  formData.append('macro', ingredient.macro)
  formData.append('createdAt', new Date().toISOString())

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/ingredient/add`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to add ingredient')
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error posting new ingredient:', error)
    return { status: 500, errorMessage: 'An error occurred while posting new ingredient' }
  }
}

export async function updateIngredient(
  ingredient: UpdateIngredientRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('id', ingredient.id)
  formData.append('name', ingredient.name)
  formData.append('rating', ingredient.rating.toString())
  formData.append('isHealthyOption', ingredient.isHealthyOption.toString())
  formData.append('cost', ingredient.cost.toString())
  formData.append('macro', ingredient.macro)
  ingredient.barcodes?.forEach((barcode) => {
    formData.append('barcodes', barcode)
  })

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/ingredient/update`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to update ingredient')
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error updating ingredient:', error)
    return { status: 500, errorMessage: 'An error occurred while updating ingredient' }
  }
}

export async function deleteDrink(
  id: string,
): Promise<{ status: number; errorMessage: string | null }> {
  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/drink/delete?id=${id}`, {
      method: 'POST',
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to delete drink')
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error deleting drink:', error)
    return { status: 500, errorMessage: 'An error occurred while deleting drink' }
  }
}

export async function deleteMeal(
  id: string,
): Promise<{ status: number; errorMessage: string | null }> {
  const options = {
    method: 'POST',
  }

  try {
    const res = await fetch(`${MEAL_API_BASE_PATH}/meal/delete?id=${id}`, options)

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, 'Failed to delete meal')
      return { status: res.status, errorMessage }
    }
    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error deleting meal:', error)
    return { status: 500, errorMessage: 'An error occurred while deleting meal' }
  }
}

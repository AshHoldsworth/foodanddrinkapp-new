import { Food } from '@/models/food'
import { Ingredient } from '@/models/ingredient'
import { Drink } from '@/models/drink'

const FOOD_API_BASE_PATH = '/backend'

export type NewFoodRequest = {
  name: string
  rating: Food['rating']
  isHealthyOption: boolean
  cost: Food['cost']
  course: Food['course']
  difficulty: Food['difficulty']
  speed: Food['speed']
  ingredients: string[]
  imageFile?: File | null
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

interface FoodFilterParams {
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

export async function getFoodData(
  filters: FoodFilterParams = {},
): Promise<{ foodItems: Food[] | null; error: string | null }> {
  let foodItems: Food[] | null = null
  let error: string | null = null

  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.isHealthy) params.set('isHealthy', 'true')
  if (filters.maxCost !== undefined) params.set('maxCost', filters.maxCost.toString())
  if (filters.maxRating !== undefined) params.set('maxRating', filters.maxRating.toString())
  if (filters.maxSpeed !== undefined) params.set('maxSpeed', filters.maxSpeed.toString())
  if (filters.newOrUpdated) params.set('newOrUpdated', 'true')

  const queryString = params.toString()
  const url = `${FOOD_API_BASE_PATH}/food/all${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return { foodItems: null, error: 'An error occurred while fetching food data' }
    }

    const json = await res.json()
    foodItems = json.data as Food[]
  } catch (err) {
    console.error('Error fetching food data:', err)
    error = 'An error occurred while fetching food data'
  }

  return { foodItems, error }
}

export async function getFoodById(
  id: string,
): Promise<{ food: Food | null; error: string | null }> {
  let food: Food | null = null
  let error: string | null = null

  try {
    const res = await fetch(`${FOOD_API_BASE_PATH}/food?id=${id}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return { food: null, error: 'An error occurred while fetching food data' }
    }

    const json = await res.json()
    food = json.data as Food
  } catch (err) {
    console.error('Error fetching food by id:', err)
    error = 'An error occurred while fetching food data'
  }

  return { food, error }
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
  const url = `${FOOD_API_BASE_PATH}/ingredient/all${queryString ? `?${queryString}` : ''}`

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

export async function postNewFood(
  food: NewFoodRequest,
): Promise<{ status: number; errorMessage: string | null }> {
  const formData = new FormData()
  formData.append('name', food.name)
  formData.append('rating', food.rating.toString())
  formData.append('isHealthyOption', food.isHealthyOption.toString())
  formData.append('cost', food.cost.toString())
  formData.append('course', food.course)
  formData.append('difficulty', food.difficulty.toString())
  formData.append('speed', food.speed.toString())
  formData.append('ingredients', JSON.stringify(food.ingredients))
  if (food.imageFile) {
    formData.append('image', food.imageFile)
  }

  const options = {
    method: 'POST',
    body: formData,
  }

  try {
    const res = await fetch(`${FOOD_API_BASE_PATH}/food/add`, options)
    if (!res.ok) {
      const errorMessage = await res.text()
      return { status: res.status, errorMessage }
    }
    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error posting new food:', error)
    return { status: 500, errorMessage: 'An error occurred while posting new food' }
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
  const url = `${FOOD_API_BASE_PATH}/drink/all${queryString ? `?${queryString}` : ''}`

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
  formData.append('ingredients', JSON.stringify(drink.ingredients))
  if (drink.imageFile) {
    formData.append('image', drink.imageFile)
  }

  try {
    const res = await fetch(`${FOOD_API_BASE_PATH}/drink/add`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errorMessage = await res.text()
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error posting new drink:', error)
    return { status: 500, errorMessage: 'An error occurred while posting new drink' }
  }
}

export async function deleteDrink(
  id: string,
): Promise<{ status: number; errorMessage: string | null }> {
  try {
    const res = await fetch(`${FOOD_API_BASE_PATH}/drink/delete?id=${id}`, {
      method: 'POST',
    })

    if (!res.ok) {
      const errorMessage = await res.text()
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error deleting drink:', error)
    return { status: 500, errorMessage: 'An error occurred while deleting drink' }
  }
}

export async function deleteFood(
  id: string,
): Promise<{ status: number; errorMessage: string | null }> {
  const options = {
    method: 'POST',
  }

  try {
    const res = await fetch(`${FOOD_API_BASE_PATH}/food/delete?id=${id}`, options)

    if (!res.ok) {
      const errorMessage = await res.text()
      return { status: res.status, errorMessage }
    }
    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error('Error deleting food:', error)
    return { status: 500, errorMessage: 'An error occurred while deleting food' }
  }
}

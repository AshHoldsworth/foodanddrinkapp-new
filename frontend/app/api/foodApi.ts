import { Food } from '@/models/food'

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

interface FoodFilterParams {
  search?: string
  isHealthy?: boolean
  maxCost?: number
  maxRating?: number
  maxSpeed?: number
  newOrUpdated?: boolean
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

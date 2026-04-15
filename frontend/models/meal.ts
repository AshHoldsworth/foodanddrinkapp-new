export type Meal = {
  id: string
  name: string
  imagePath?: string | null
  rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  isHealthyOption: boolean
  cost: 1 | 2 | 3
  course: 'Breakfast' | 'Lunch' | 'Dinner'
  difficulty: 1 | 2 | 3
  speed: 1 | 2 | 3
  ingredients: string[]
  createdAt: Date
  updatedAt: Date | null
}

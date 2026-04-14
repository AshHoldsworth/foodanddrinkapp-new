export type Drink = {
  id: string
  name: string
  imagePath?: string | null
  rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  isHealthyOption: boolean
  cost: 1 | 2 | 3
  difficulty: 1 | 2 | 3
  speed: 1 | 2 | 3
  ingredients: string[]
  createdAt: Date
  updatedAt: Date | null
}
export type Ingredient = {
  id: string
  name: string
  rating: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  isHealthyOption: boolean
  cost: 1 | 2 | 3
  macro: 'Protein' | 'Carbs' | 'Fat'
  barcodes: string[] | null
  createdAt: Date
  updatedAt: Date | null
}

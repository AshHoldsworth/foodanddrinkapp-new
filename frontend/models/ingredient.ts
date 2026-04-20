import { MacroOption } from '@/constants'
import { Rating, Cost } from './scales'

export type Ingredient = {
  id: string
  name: string
  rating: Rating
  isHealthyOption: boolean
  cost: Cost
  macro: MacroOption
  stockQuantity: number
  barcodes: string[] | null
  createdAt: Date
  updatedAt: Date | null
}

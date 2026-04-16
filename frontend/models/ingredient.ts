import { MacroOption } from '@/constants'
import { Rating } from './rating'
import { Cost } from './scales'

export type Ingredient = {
  id: string
  name: string
  rating: Rating
  isHealthyOption: boolean
  cost: Cost
  macro: MacroOption
  barcodes: string[] | null
  createdAt: Date
  updatedAt: Date | null
}

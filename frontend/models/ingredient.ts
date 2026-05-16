import { MacroOption } from '@/constants'

export type Ingredient = {
  id: string
  name: string
  isHealthyOption: boolean
  macro: MacroOption
  uoM: string
  stockQuantity: number
  barcodes: string[] | null
  createdAt: Date
  updatedAt: Date | null
}

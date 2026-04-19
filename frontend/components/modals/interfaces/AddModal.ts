import { AlertProps } from '@/components/errors/Alert'
import { CourseOption, MacroOption } from '@/constants'
import { Cost, Difficulty, MealIngredient, Rating, Speed } from '@/models'
import { Dispatch, SetStateAction } from 'react'

export interface ModalContents {
  label: 'Meal' | 'Drink' | 'Ingredient'
  ingredients: boolean
  course: boolean
  difficulty: boolean
  speed: boolean
  macro: boolean
  image: boolean
}

export interface ModalInitialValues {
  id: string
  name: string
  rating: Rating
  isHealthyOption: boolean
  cost: Cost
  ingredients?: MealIngredient[]
  course?: CourseOption
  difficulty?: Difficulty
  speed?: Speed
  macro?: MacroOption
  barcodes?: string[] | null
}

export interface AddModalProps {
  setShowAddModal: (show: boolean) => void
  modalContents: ModalContents
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  initialValues?: ModalInitialValues
  onSuccess?: () => void
}

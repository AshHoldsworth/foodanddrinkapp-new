import { AlertProps } from '@/components/Alert'
import { CourseOption, MacroOption } from '@/constants'
import { Cost, Difficulty, MealIngredient, Rating, Speed } from '@/models'
import { Dispatch, SetStateAction } from 'react'

/** Shared shape for meal / ingredient edit payloads passed into the modals. */
export interface ModalFormInitialValues {
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
  uoM?: string
  barcodes?: string[] | null
}

export interface MealModalProps {
  setOpen: (open: boolean) => void
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  initialValues?: ModalFormInitialValues
  onSuccess?: () => void
}

export interface IngredientModalProps {
  setOpen: (open: boolean) => void
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  initialValues?: ModalFormInitialValues
  onSuccess?: () => void
}

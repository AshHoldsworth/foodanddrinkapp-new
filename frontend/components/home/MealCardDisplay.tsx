import { MealCard } from '@/components/home/MealCard'
import { Meal } from '@/models'
import { Dispatch, SetStateAction } from 'react'
import { AlertProps } from '../errors/Alert'

interface MealCardDisplayProps {
  mealItems: Meal[]
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (meal: Meal) => void
  onOpen: (meal: Meal) => void
  onDeleteSuccess: () => void | Promise<void>
}

export const MealCardDisplay = ({
  mealItems,
  setAlertProps,
  onEdit,
  onOpen,
  onDeleteSuccess,
}: MealCardDisplayProps) => {
  return (
    <div className="flex flex-wrap gap-5 justify-start py-8 mx-5">
      {mealItems && mealItems.length > 0 ? (
        mealItems?.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            setAlertProps={setAlertProps}
            onEdit={onEdit}
            onOpen={onOpen}
            onDeleteSuccess={onDeleteSuccess}
          />
        ))
      ) : (
        <div>No meal items</div>
      )}
    </div>
  )
}

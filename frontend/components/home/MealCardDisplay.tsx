import { MealCard } from '@/components/cards/MealCard'
import { Meal } from '@/models'
import { Dispatch, SetStateAction } from 'react'
import { AlertProps } from '../errors/Alert'

interface MealCardDisplayProps {
  mealItems: Meal[]
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (meal: Meal) => void
  onDeleteSuccess: () => void | Promise<void>
}

export const MealCardDisplay = ({
  mealItems,
  setAlertProps,
  onEdit,
  onDeleteSuccess,
}: MealCardDisplayProps) => {
  return (
    <div className="flex flex-wrap gap-5 justify-start py-4 mx-5">
      {mealItems && mealItems.length > 0 ? (
        mealItems?.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            setAlertProps={setAlertProps}
            onEdit={onEdit}
            onDeleteSuccess={onDeleteSuccess}
          />
        ))
      ) : (
        <div>No meal items</div>
      )}
    </div>
  )
}

import { FoodCard } from '@/components/home/FoodCard'
import { Food } from '@/models/food'
import { Dispatch, SetStateAction } from 'react'
import { AlertProps } from '../Alert'

interface FoodCardDisplayProps {
  foodItems: Food[]
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  onEdit: (food: Food) => void
}

export const FoodCardDisplay = ({ foodItems, setAlertProps, onEdit }: FoodCardDisplayProps) => {
  return (
    <div className="flex flex-wrap gap-5 justify-start py-8 mx-5">
      {foodItems && foodItems.length > 0 ? (
        foodItems?.map((food) => (
          <FoodCard key={food.id} food={food} setAlertProps={setAlertProps} onEdit={onEdit} />
        ))
      ) : (
        <div>No food items</div>
      )}
    </div>
  )
}

import { FoodCard } from "@/components/home/FoodCard"
import { Food } from "@/models/food"
import { Dispatch, SetStateAction } from "react"
import { AlertProps } from "../Alert"

interface FoodCardDisplayProps {
    foodItems: Food[]
    setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
}

export const FoodCardDisplay = ({ foodItems, setAlertProps }: FoodCardDisplayProps) => {
    return (
        <div className="flex flex-wrap gap-5 justify-start py-8 mx-5">
            {foodItems && foodItems.length > 0 ? (
                foodItems?.map((food) => (
                    <FoodCard
                        key={food.id}
                        id={food.id}
                        name={food.name}
                        rating={food.rating}
                        isHealthyOption={food.isHealthyOption}
                        cost={food.cost}
                        course={food.course}
                        difficulty={food.difficulty}
                        speed={food.speed}
                        createdAt={new Date(food.createdAt)}
                        updatedAt={
                            food.updatedAt ? new Date(food.updatedAt) : null
                        }
                        setAlertProps={setAlertProps}
                    />
                ))
            ) : (
                <div>No food items</div>
            )}
        </div>
    )
}

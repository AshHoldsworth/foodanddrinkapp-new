import { FoodCard } from "@/components/home/FoodCard"
import { Food } from "@/models/food"

interface FoodCardDisplayProps {
    foodItems: Food[]
}

export const FoodCardDisplay = ({ foodItems }: FoodCardDisplayProps) => {
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
                        ingredients={food.ingredients}
                        createdAt={new Date(food.createdAt)}
                        updatedAt={
                            food.updatedAt ? new Date(food.updatedAt) : null
                        }
                    />
                ))
            ) : (
                <div>No food items</div>
            )}
        </div>
    )
}

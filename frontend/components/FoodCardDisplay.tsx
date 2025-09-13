"use client"
import { useEffect, useState } from "react"
import { FoodCard } from "@/components/FoodCard"
import { FoodFilterBar } from "./FoodFilterBar"
import { Food } from "@/models/food"

interface FoodCardDisplayProps {
    foodItems?: Food[]
}

const FoodCardDisplay = ({ foodItems }: FoodCardDisplayProps) => {
    const [searchInput, setSearchInput] = useState<string>("")
    const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
    const [foodItemsState, setFoodItemsState] = useState<Food[] | null>(null)
    const [cost, setCost] = useState<number>(3)
    const [rating, setRating] = useState<number>(10)
    const [speed, setSpeed] = useState<number>(3)

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHealthyToggleState(e.target.checked)
    }

    const onCostChange = (value: number) => {
        setCost(value)
    }

    const onRatingChange = (value: number) => {
        setRating(value)
    }

    const onSpeedChange = (value: number) => {
        setSpeed(value)
    }

    useEffect(() => {
        setFoodItemsState(
            foodItems
                ? foodItems.filter((food) => {
                      const matchesSearch = food.name
                          .toLowerCase()
                          .includes(searchInput.toLowerCase())
                      const matchesHealthyToggle = healthyToggleState
                          ? food.isHealthyOption
                          : true
                      const matchesCost = food.cost <= cost
                      const matchesRating = food.rating <= rating
                      const matchesSpeed = food.speed <= speed
                      return (
                          matchesSearch &&
                          matchesHealthyToggle &&
                          matchesCost &&
                          matchesRating &&
                          matchesSpeed
                      )
                  })
                : null
        )
    }, [searchInput, healthyToggleState, cost, rating, speed, foodItems])

    return (
        <>
            <FoodFilterBar
                onSearchChange={onSearchChange}
                searchInput={searchInput}
                onHealthyToggleChange={onHealthyToggleChange}
                healthyToggleState={healthyToggleState}
                onCostChange={onCostChange}
                cost={cost}
                onRatingChange={onRatingChange}
                rating={rating}
                onSpeedChange={onSpeedChange}
                speed={speed}
            />
            <div className="flex flex-wrap gap-5 justify-start py-8 mx-5">
                {foodItemsState && foodItemsState.length > 0 ? (
                    foodItemsState?.map((food) => (
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
        </>
    )
}

export default FoodCardDisplay

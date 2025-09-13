"use client"
import { FoodFilterBar } from "@/components/home/FoodFilterBar"
import FoodCardDisplay from "./FoodCardDisplay"
import { Suspense, useEffect, useState } from "react"
import { Food } from "@/models/food"
import isNewOrRecentlyUpdated from "@/utils/isNewOrRecentlyUpdated"
import Loading from "@/app/loading"

interface FoodPageProps {
    foodItems: Food[]
}

const FoodPage = ({ foodItems }: FoodPageProps) => {
    const [foodItemsState, setFoodItemsState] = useState<Food[]>([])
    const [searchInput, setSearchInput] = useState<string>("")
    const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
    const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] =
        useState<boolean>(false)
    const [cost, setCost] = useState<number>(3)
    const [rating, setRating] = useState<number>(10)
    const [speed, setSpeed] = useState<number>(3)

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    const onSearchClear = () => {
        setSearchInput("")
    }

    const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHealthyToggleState(e.target.checked)
    }

    const onNewOrUpdatedToggleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewOrUpdatedToggleState(e.target.checked)
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
            foodItems.filter((food) => {
                const matchesSearch = food.name
                    .toLowerCase()
                    .includes(searchInput.toLowerCase())
                const matchesHealthyToggle = healthyToggleState
                    ? food.isHealthyOption
                    : true
                const matchesCost = food.cost <= cost
                const matchesRating = food.rating <= rating
                const matchesSpeed = food.speed <= speed
                const matchesNewOrUpdatedToggle =
                    newOrUpdatedToggleState ?
                    isNewOrRecentlyUpdated(
                        new Date(food.createdAt),
                        food.updatedAt ? new Date(food.updatedAt) : null
                    ) : true
                return (
                    matchesSearch &&
                    matchesHealthyToggle &&
                    matchesCost &&
                    matchesRating &&
                    matchesSpeed &&
                    matchesNewOrUpdatedToggle
                )
            })
        )
    }, [
        searchInput,
        healthyToggleState,
        cost,
        rating,
        speed,
        newOrUpdatedToggleState,
        foodItems,
    ])

    return (
        <>
            <FoodFilterBar
                onSearchChange={onSearchChange}
                searchInput={searchInput}
                onSearchClear={onSearchClear}
                onHealthyToggleChange={onHealthyToggleChange}
                healthyToggleState={healthyToggleState}
                onNewOrUpdatedToggleChange={onNewOrUpdatedToggleChange}
                newOrUpdatedToggleState={newOrUpdatedToggleState}
                onCostChange={onCostChange}
                cost={cost}
                onRatingChange={onRatingChange}
                rating={rating}
                onSpeedChange={onSpeedChange}
                speed={speed}
            />
            <Suspense fallback={<Loading />}>
                <FoodCardDisplay foodItems={foodItemsState} />
            </Suspense>
        </>
    )
}

export default FoodPage

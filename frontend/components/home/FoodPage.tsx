"use client"
import { useEffect, useState } from "react"
import { Error } from "@/components/Error"
import { FoodFilterBar } from "@/components/home/FoodFilterBar"
import { FoodCardDisplay } from "./FoodCardDisplay"
import { Food } from "@/models/food"
import { isNewOrRecentlyUpdated } from "@/utils/isNewOrRecentlyUpdated"
import { FloatingActionButton } from "../FloatingActionButton"
import { AddModal, ModalContents } from "../AddModal"

interface FoodPageProps {
    foodItems: Food[] | null
    error: string | null
}

const FoodPage = ({ foodItems, error }: FoodPageProps) => {
    const [foodItemsState, setFoodItemsState] = useState<Food[]>([])
    const [searchInput, setSearchInput] = useState<string>("")
    const [healthyToggleState, setHealthyToggleState] = useState<boolean>(false)
    const [newOrUpdatedToggleState, setNewOrUpdatedToggleState] =
        useState<boolean>(false)
    const [cost, setCost] = useState<number>(3)
    const [rating, setRating] = useState<number>(10)
    const [speed, setSpeed] = useState<number>(3)
    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [modalContents, setModalContents] = useState<ModalContents | null>(
        null
    )

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
        foodItems &&
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
                    const matchesNewOrUpdatedToggle = newOrUpdatedToggleState
                        ? isNewOrRecentlyUpdated(
                              new Date(food.createdAt),
                              food.updatedAt ? new Date(food.updatedAt) : null
                          )
                        : true
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

    const onAddFoodClick = () => {
        const modalContents: ModalContents = {
            label: "Food",
            ingredients: true,
            course: true,
            difficulty: true,
            speed: true,
            macro: false
        }

        setModalContents(modalContents)
        setShowAddModal(true)
    }

    const onAddDrinkClick = () => {
        const modalContents: ModalContents = {
            label: "Drink",
            ingredients: true,
            course: false,
            difficulty: true,
            speed: true,
            macro: false
        }
        setModalContents(modalContents)
        setShowAddModal(true)
    }

    const onAddIngredientClick = () => {
        const modalContents: ModalContents = {
            label: "Ingredient",
            ingredients: false,
            course: false,
            difficulty: false,
            speed: false,
            macro: true
        }
        setModalContents(modalContents)
        setShowAddModal(true)
    }

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

            {!error ? (
                <FoodCardDisplay foodItems={foodItemsState} />
            ) : (
                <div className="my-20">
                    <Error title="Error" message={error} />
                </div>
            )}

            <FloatingActionButton
                onFoodClick={onAddFoodClick}
                onDrinkClick={onAddDrinkClick}
                onIngredientClick={onAddIngredientClick}
            />

            {showAddModal && (
                <AddModal
                    setShowAddModal={setShowAddModal}
                    modalContents={modalContents!}
                />
            )}
        </>
    )
}

export default FoodPage

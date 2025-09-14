"use client"
import { Dispatch, SetStateAction, useState } from "react"
import { Toggle } from "./Toggle"
import { Select } from "./Select"

export interface ModalContents {
    label: "Food" | "Drink" | "Ingredient"
    ingredients: boolean
    course: boolean
    difficulty: boolean
    speed: boolean
    macro: boolean
}

interface AddModalProps {
    setShowAddModal: Dispatch<SetStateAction<boolean>>
    modalContents: ModalContents
}

export const AddModal = ({ setShowAddModal, modalContents }: AddModalProps) => {
    const [name, setName] = useState<string>("")
    const [isHealthyOption, setIsHealthyOption] = useState<boolean>(false)
    const [cost, setCost] = useState<number>(0)
    const [rating, setRating] = useState<number>(0)
    const [speed, setSpeed] = useState<number>(0)
    const [course, setCourse] = useState<string>("")
    const [ingredients, setIngredients] = useState<string>("")

    const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsHealthyOption(e.target.checked)
    }

    const onCostChange = (value: string) => {
        if (value === "Cheap") setCost(1)
        else if (value === "Moderate") setCost(2)
        else if (value === "Expensive") setCost(3)
    }

    const onSpeedChange = (value: string) => {
        if (value === "Slow") setSpeed(1)
        else if (value === "Average") setSpeed(2)
        else if (value === "Quick") setSpeed(3)
    }

    const onSubmit = () => {}

    return (
        <div className="w-screen h-screen z-100 flex justify-center items-center fixed top-0 left-0 bg-primary-content">
            <div className="bg-white p-4 rounded shadow-md w-screen h-screen sm:w-2xl sm:h-auto">
                <h3 className="font-bold text-lg">
                    Add New {modalContents.label}
                </h3>
                <div className="modal-body">
                    <div className="flex gap-3 mb-2 items-center">
                        <legend className="fieldset-legend">Name</legend>
                        <input
                            type="text"
                            placeholder={`${modalContents.label} Name`}
                            className="input input-bordered grow"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <Toggle
                            label="Healthy Option"
                            checked={isHealthyOption}
                            onChange={onHealthyToggleChange}
                            className="sm:flex items-start font-bold hidden"
                        />
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <legend className="fieldset-legend">Rating</legend>
                        <div className="rating">
                            <input
                                type="radio"
                                name="rating-1"
                                className="mask mask-star"
                                aria-label="1 star"
                                onClick={() => setRating(1)}
                            />
                            <input
                                type="radio"
                                name="rating-1"
                                className="mask mask-star"
                                aria-label="2 star"
                                defaultChecked
                                onClick={() => setRating(2)}
                            />
                            <input
                                type="radio"
                                name="rating-1"
                                className="mask mask-star"
                                aria-label="3 star"
                                onClick={() => setRating(3)}
                            />
                        </div>
                        <Toggle
                            label="Healthy Option"
                            checked={isHealthyOption}
                            onChange={onHealthyToggleChange}
                            className="flex items-start font-bold sm:hidden"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row w-full gap-2 justify-between">
                        <div className="flex gap-3 mb-2 items-center grow">
                            <label className="fieldset-legend">Cost</label>
                            <Select
                                default="Moderate"
                                onChange={(e) => onCostChange(e)}
                                options={["Cheap", "Moderate", "Expensive"]}
                            />
                        </div>

                        <div className="flex gap-3 mb-2 items-center grow">
                            <label className="fieldset-legend">Speed</label>
                            <Select
                                default="Average"
                                onChange={(e) => onSpeedChange(e)}
                                options={["Slow", "Average", "Quick"]}
                            />
                        </div>

                        {modalContents.course && (
                            <div className="flex gap-3 mb-2 items-center grow">
                                <label className="fieldset-legend">
                                    Course
                                </label>
                                <Select
                                    default="Dinner"
                                    onChange={(value) => setCourse(value)}
                                    options={["Breakfast", "Lunch", "Dinner"]}
                                />
                            </div>
                        )}
                    </div>

                    {modalContents.ingredients && (
                        <input
                            type="text"
                            placeholder="Ingredients (comma separated)"
                            className="input input-bordered w-full"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                        />
                    )}
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={onSubmit}>
                        Add {modalContents.label}
                    </button>
                    <button
                        className="btn"
                        onClick={() => setShowAddModal(false)}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

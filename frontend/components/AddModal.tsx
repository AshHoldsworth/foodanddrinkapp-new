import { Dispatch, SetStateAction, useState } from "react"
import { Toggle } from "./Toggle"
import { Select } from "./Select"
import { RangeSelector } from "./RangeSelector"
import { Food } from "@/models/food"
import { XMarkIcon } from "@heroicons/react/16/solid"
import { postNewFood } from "@/app/api/foodApi"
import { AlertProps } from "./Alert"

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
    setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
}

export const AddModal = ({
    setShowAddModal,
    modalContents,
    setAlertProps,
}: AddModalProps) => {
    const [name, setName] = useState<string>("")
    const [isHealthyOption, setIsHealthyOption] = useState<boolean>(false)
    const [cost, setCost] = useState<1 | 2 | 3>(1)
    const [rating, setRating] = useState<
        1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
    >(5)
    const [speed, setSpeed] = useState<1 | 2 | 3>(1)
    const [course, setCourse] = useState<"Breakfast" | "Lunch" | "Dinner">(
        "Dinner"
    )
    const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2)
    const [macro, setMacro] = useState<"Protein" | "Carbs" | "Fat">("Protein")
    const [ingredientInput, setIngredientInput] = useState<string>("")
    const [ingredients, setIngredients] = useState<string[]>([])

    const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsHealthyOption(e.target.checked)
    }

    const onCostChange = (value: string) => {
        if (value === "Cheap") setCost(1)
        else if (value === "Moderate") setCost(2)
        else if (value === "Expensive") setCost(3)
        else
            throw new Error("cost must be either Cheap, Moderate or Expensive.")
    }

    const onSpeedChange = (value: string) => {
        if (value === "Slow") setSpeed(1)
        else if (value === "Average") setSpeed(2)
        else if (value === "Quick") setSpeed(3)
        else throw new Error("speed must be either Slow, Average or Quick.")
    }

    const onDifficultyChange = (value: number) => {
        if (value === 1) setDifficulty(1)
        else if (value === 2) setDifficulty(2)
        else if (value === 3) setDifficulty(3)
        else throw new Error("difficulty must be either 1, 2 or 3.")
    }

    const onCourseChange = (value: string) => {
        if (value === "Breakfast") setCourse("Breakfast")
        else if (value === "Lunch") setCourse("Lunch")
        else if (value === "Dinner") setCourse("Dinner")
        else
            throw new Error("course must be either Breakfast, Lunch or Dinner.")
    }

    const onMacroChange = (value: string) => {
        if (value === "Protein") setMacro("Protein")
        else if (value === "Carbs") setMacro("Carbs")
        else if (value === "Fat") setMacro("Fat")
        else throw new Error("macro must be either Protein, Carbs or Fat.")
    }

    const onAddIngredient = (value: string) => {
        if (ingredients.includes(value)) {
            setIngredientInput("")
            return
        }
        setIngredients([...ingredients, value])
        setIngredientInput("")
    }

    const onAlertCloseClick = () => {
        setAlertProps(undefined)
    }

    const onSubmit = async () => {
        if (name.trim() === "") {
            setAlertProps({
                type: "warning",
                message: "Name cannot be blank",
                onCloseClick: onAlertCloseClick,
            })

            return
        }

        if (modalContents.ingredients && ingredients.length === 0) {
            setAlertProps({
                type: "warning",
                message: "At least one ingredient must be added",
                onCloseClick: onAlertCloseClick,
            })

            return
        }

        if (modalContents.label === "Food") {
            if (course === undefined)
                throw new Error("Course cannot be undefined")

            const food: Food = {
                id: crypto.randomUUID(),
                name,
                rating,
                isHealthyOption,
                cost,
                course,
                difficulty,
                speed,
                ingredients,
                createdAt: new Date(),
                updatedAt: null,
            }

            const { status, errorMessage } = await postNewFood(food)

            if (status !== 200) {
                console.error("Error posting new food:", errorMessage)
                setAlertProps({
                    type: "error",
                    message: errorMessage!,
                    onCloseClick: onAlertCloseClick,
                })
            } else {
                setShowAddModal(false)
                setAlertProps({
                    type: "success",
                    message: "Food successfully added.",
                    onCloseClick: onAlertCloseClick,
                })
            }
        }
    }

    return (
        <div className="w-screen h-screen z-100 flex justify-center items-center fixed top-0 left-0 bg-black/75">
            <div className="bg-white p-4 rounded shadow-md w-screen h-screen sm:w-2xl sm:h-auto">
                <h3 className="font-bold text-lg mb-5">
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
                            label="Healthy Choice"
                            checked={isHealthyOption}
                            onChange={onHealthyToggleChange}
                            className="flex items-start font-bold"
                        />
                    </div>

                    <RangeSelector
                        label="Rating"
                        min={1}
                        max={10}
                        step={1}
                        options={["1", "5", "10"]}
                        value={rating}
                        onChange={(value: number) =>
                            setRating(value as 1 | 2 | 3)
                        }
                        className="mb-3"
                    />

                    <div className="flex flex-col sm:flex-row w-full gap-2 justify-between">
                        <div className="flex gap-3 mb-2 items-center grow">
                            <label className="fieldset-legend">Cost</label>
                            <Select
                                defaultValue="Moderate"
                                onChange={(e) => onCostChange(e)}
                                options={["Cheap", "Moderate", "Expensive"]}
                            />
                        </div>

                        {modalContents.speed && (
                            <div className="flex gap-3 mb-2 items-center grow">
                                <label className="fieldset-legend">Speed</label>
                                <Select
                                    defaultValue="Average"
                                    onChange={(e) => onSpeedChange(e)}
                                    options={["Slow", "Average", "Quick"]}
                                />
                            </div>
                        )}

                        {modalContents.course && (
                            <div className="flex gap-3 mb-2 items-center grow">
                                <label className="fieldset-legend">
                                    Course
                                </label>
                                <Select
                                    defaultValue="Dinner"
                                    onChange={(value) => onCourseChange(value)}
                                    options={["Breakfast", "Lunch", "Dinner"]}
                                />
                            </div>
                        )}

                        {modalContents.macro && (
                            <div className="flex gap-3 mb-2 items-center grow">
                                <label className="fieldset-legend">Macro</label>
                                <Select
                                    defaultValue="Protein"
                                    onChange={(value) => onMacroChange(value)}
                                    options={["Protein", "Carbs", "Fat"]}
                                />
                            </div>
                        )}
                    </div>

                    {modalContents.difficulty && (
                        <div className="mb-2">
                            <RangeSelector
                                label="Difficulty"
                                min={1}
                                max={3}
                                step={1}
                                options={["Easy", "Medium", "Hard"]}
                                value={difficulty}
                                onChange={(value: number) =>
                                    onDifficultyChange(value)
                                }
                                className="mb-3"
                            />
                        </div>
                    )}

                    {modalContents.ingredients && (
                        <>
                            <div className="flex gap-2 mb-2">
                                <legend className="fieldset-legend">
                                    Ingredient
                                </legend>
                                <div className="relative grow">
                                    <input
                                        type="text"
                                        className="input w-full pr-10"
                                        value={ingredientInput}
                                        onChange={(e) =>
                                            setIngredientInput(e.target.value)
                                        }
                                    />
                                    <XMarkIcon
                                        className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setIngredientInput("")}
                                    />
                                </div>
                                <button
                                    className="btn"
                                    onClick={() =>
                                        onAddIngredient(ingredientInput)
                                    }>
                                    Add
                                </button>
                                <button
                                    className="btn btn-outline  btn-error"
                                    onClick={() => setIngredients([])}>
                                    Clear All
                                </button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {ingredients.map((ing, index) => (
                                    <div
                                        className={`badge badge-soft flex items-center gap-1 ${
                                            index % 2 === 0
                                                ? "badge-primary"
                                                : "badge-secondary"
                                        }`}
                                        key={index}>
                                        {ing}
                                        <XMarkIcon
                                            className="w-4 h-4 cursor-pointer hover:text-red-500 ml-1"
                                            onClick={() =>
                                                setIngredients(
                                                    ingredients.filter(
                                                        (_, i) => i !== index
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="modal-action">
                    <button
                        className="btn btn-error"
                        onClick={() => setShowAddModal(false)}>
                        Close
                    </button>
                    <button className="btn btn-success" onClick={onSubmit}>
                        Add {modalContents.label}
                    </button>
                </div>
            </div>
        </div>
    )
}

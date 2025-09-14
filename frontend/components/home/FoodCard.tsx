import { deleteFood } from "@/app/api/foodApi"
import {
    costMapping,
    difficultyMapping,
    speedMapping,
} from "@/utils/foodMappings"
import { isNewOrRecentlyUpdated } from "@/utils/isNewOrRecentlyUpdated"
import Image from "next/image"
import Link from "next/link"
import { Dispatch, SetStateAction } from "react"
import { AlertProps } from "../Alert"

interface FoodCardProps {
    id: string
    name: string
    rating: number
    isHealthyOption: boolean
    cost: number
    course: string
    difficulty: number
    speed: number
    createdAt: Date
    updatedAt: Date | null
    setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
}

export const FoodCard = ({
    id,
    name,
    rating,
    isHealthyOption,
    cost,
    course,
    difficulty,
    speed,
    createdAt,
    updatedAt,
    setAlertProps,
}: FoodCardProps) => {
    const onEdit = () => {
        console.log("Edit Clicked")
    }

    const onDelete = async () => {
        const { status, errorMessage } = await deleteFood(id)

        if (status === 200) {
            setAlertProps({
                type: "success",
                message: `Food ${name} deleted successfully`,
            })
        } else {
            setAlertProps({
                type: "error",
                message: errorMessage!,
            })
        }
    }

    const recentlyUpdated = isNewOrRecentlyUpdated(createdAt, updatedAt)

    return (
        <div
            className="card bg-base-100 w-96 shadow-sm grow"
            tabIndex={0}
            key={id}>
            <Link href={`/food/${id}`}>
                <Image
                    src="/food-placeholder.png"
                    alt="Food Image"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                />
            </Link>

            <div className="card-body">
                <h2 className="card-title">
                    {name}
                    {recentlyUpdated && (
                        <div className="badge badge-secondary">UPDATED</div>
                    )}
                </h2>

                <p>Rating: {rating} / 10 </p>
                <p>Difficulty: {difficultyMapping[difficulty]}</p>
                <p>Speed: {speedMapping[speed]}</p>
                <p>Cost: {costMapping[cost]}</p>

                <div className="card-actions justify-start">
                    <div className="badge badge-outline badge-primary">
                        {course}
                    </div>
                    {isHealthyOption && (
                        <div className="badge badge-outline badge-success">
                            Healthy Choice
                        </div>
                    )}
                </div>

                <div className="card-actions justify-end">
                    <button className="btn btn-outline" onClick={onEdit}>
                        Edit
                    </button>
                    <button
                        className="btn btn-outline btn-error"
                        onClick={onDelete}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

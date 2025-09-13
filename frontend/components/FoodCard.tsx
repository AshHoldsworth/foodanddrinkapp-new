"use client"
import {
    costMapping,
    difficultyMapping,
    speedMapping,
} from "@/constants/foodMappings"
import Image from "next/image"
import Link from "next/link"

interface FoodCardProps {
    id: string
    name: string
    rating: number
    isHealthyOption: boolean
    cost: number
    course: string
    difficulty: number
    speed: number
    ingredients: string[]
    createdAt: Date
    updatedAt: Date | null
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
    ingredients,
    createdAt,
    updatedAt,
}: FoodCardProps) => {
    const onEdit = () => {
        console.log("Edit Clicked")
    }

    const onDelete = () => {
        console.log("Delete Clicked")
    }

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
    const isNew = createdAt.getTime() > Date.now() - ONE_WEEK_MS
    const recentlyUpdated = updatedAt
        ? updatedAt.getTime() > Date.now() - ONE_WEEK_MS
        : false

    return (
        <div
            className="card bg-base-100 w-96 shadow-sm "
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
                    {recentlyUpdated ? (
                        <div className="badge badge-secondary">UPDATED</div>
                    ) : isNew ? (
                        <div className="badge badge-secondary">NEW</div>
                    ) : null}
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

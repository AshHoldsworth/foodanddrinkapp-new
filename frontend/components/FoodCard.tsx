"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

interface FoodCardProps {
    title: string
    description: string
    imageUrl: string
    tags: string[]
    isNew?: boolean
}

export const FoodCard = ({
    title,
    description,
    imageUrl,
    tags,
    isNew,
}: FoodCardProps) => {
    const router = useRouter();

    const onClick = () => {
        console.log("Card clicked")
        router.push(`/food/${title.toLowerCase()}`)
    }

    return (
        <div
            className="card bg-base-100 w-96 shadow-sm grow"
            onClick={onClick}
            role="button"
            tabIndex={0}>
            <Image
                src={imageUrl}
                alt="Food Image"
                width={0}
                height={0}
                placeholder="blur"
                blurDataURL="/food-placeholder.png"
                className="w-full h-auto object-cover"
                sizes="(max-width: 384px) 100vw, 384px"
            />

            <div className="card-body">
                <h2 className="card-title">
                    {title}
                    {isNew && <div className="badge badge-secondary">NEW</div>}
                </h2>
                <p>{description}</p>
                <div className="card-actions justify-end">
                    {tags.map((tag) => (
                        <div className="badge badge-outline" key={tag}>
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

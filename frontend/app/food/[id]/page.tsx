'use client'

import { useParams } from "next/navigation"

const FoodPage = () => {
    const params = useParams();

    return <div>FOOD PAGE {params.id}</div>
}

export default FoodPage

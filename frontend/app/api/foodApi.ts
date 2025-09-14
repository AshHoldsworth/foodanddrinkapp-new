import { Food } from "@/models/food"

export async function getFoodData(): Promise<{ foodItems: Food[] | null, error: string | null }> {
    let foodItems: Food[] | null = null
    let error: string | null = null

    try {
        const res = await fetch("http://localhost:5237/food/all", {
            cache: 'no-store',
        })
        
        if (!res.ok) {
            return { foodItems: null, error: "An error occurred while fetching food data" }
        }
        
        const json = await res.json()
        foodItems = json.data as Food[]
        
    } catch (err) {
        console.error("Error fetching food data:", err)
        error = "An error occurred while fetching food data"
    }

    return { foodItems, error }
}

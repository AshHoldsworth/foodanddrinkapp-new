import { Food } from "@/models/food"

export async function getFoodData(): Promise<{ foodItems: Food[], error: string | null }> {
    let foodItems: Food[] = []
    let error: string | null = null

    try {
        const res = await fetch("http://localhost:5237/food/all", {
            cache: 'no-store', // This ensures fresh data but prevents excessive calls
        })
        
        if (!res.ok) {
            throw new Error(`Failed to fetch food data: ${res.status}`)
        }
        
        const json = await res.json()
        foodItems = json.data as Food[]
        
    } catch (err) {
        console.error("Error fetching food data:", err)
        error = "An error occurred while fetching food data"
    }

    return { foodItems, error }
}

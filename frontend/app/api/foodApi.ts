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

export async function postNewFood(food: Food): Promise<{status: number, errorMessage: string | null}> {

    const formData = new FormData()
    formData.append("id", food.id)
    formData.append("name", food.name)
    formData.append("rating", food.rating.toString())
    formData.append("isHealthyOption", food.isHealthyOption.toString())
    formData.append("cost", food.cost.toString())
    formData.append("course", food.course)
    formData.append("difficulty", food.difficulty.toString())
    formData.append("speed", food.speed.toString())
    formData.append("ingredients", JSON.stringify(food.ingredients))

    const options = {
        method: 'POST',
        body: formData
    }

    try {
        const res = await fetch("http://localhost:5237/food/add", options)
        if (!res.ok) {
            const errorMessage = await res.text()
            return { status: res.status, errorMessage }
        }
        return { status: 200, errorMessage: null }
    } catch (error) {
        console.error("Error posting new food:", error)
        return { status: 500, errorMessage: "An error occurred while posting new food" }
    }
}

export async function deleteFood(id: string): Promise<{status: number, errorMessage: string | null}> {
    
    const options = {
        method: 'POST'
    }

    try {
        const res = await fetch(`http://localhost:5237/food/delete?id=${id}`, options)

        if (!res.ok) {
            const errorMessage = await res.text()
            return { status: res.status, errorMessage }
        }
        return { status: 200, errorMessage: null }
    } catch (error) {
        console.error("Error deleting food:", error)
        return { status: 500, errorMessage: "An error occurred while deleting food" }
    }
}

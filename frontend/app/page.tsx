import FoodPage from "@/components/home/FoodPage"
import { getFoodData } from "./api/foodApi"


const Home = async () => {
    const { foodItems, error } = await getFoodData()

    return <FoodPage foodItems={foodItems} error={error} />
}

export default Home

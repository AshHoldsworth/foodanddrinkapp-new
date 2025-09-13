import FoodPage from "@/components/home/FoodPage"
import { Food } from "@/models/food"

const Home = async () => {
    const res = await fetch("http://localhost:5237/food/all")
    const json = await res.json()

    return <FoodPage foodItems={json.data as Food[]} />
}

export default Home

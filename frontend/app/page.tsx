import FoodPage from "@/components/home/FoodPage"
import { getFoodData } from "./api/foodApi"
import { Error } from "@/components/Error"

const Home = async () => {
    const { foodItems, error } = await getFoodData()

    return error ? (
        <div className="my-10">
            <Error title="Error" message={error} />
        </div>
    ) : (
        <FoodPage foodItems={foodItems} />
    )
}

export default Home

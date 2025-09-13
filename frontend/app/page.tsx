import FoodCardDisplay from "@/components/FoodCardDisplay"

const Home = async () => {
    const res = await fetch("http://localhost:5237/food/all")
    const json = await res.json()

    return (
        <FoodCardDisplay foodItems={json.data} />
    )
}

export default Home

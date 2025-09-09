import { FoodCard } from "@/components/FoodCard"

const Home = () => {
    return (
        <div className="flex flex-wrap gap-5 justify-start py-8">
            <FoodCard
                title="Pizza"
                description="A tasty pizza with fresh ingredients."
                imageUrl="/food-placeholder.png"
                tags={["Italian", "Pizza", "Fast Food"]}
            />
            <FoodCard
                title="Salad"
                description="A fresh salad with a variety of vegetables."
                imageUrl="/food-placeholder.png"
                tags={["Healthy", "Salad", "Vegetarian"]}
                isNew
            />
        </div>
    )
}

export default Home

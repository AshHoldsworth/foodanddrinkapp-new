import { FoodCard } from "@/components/FoodCard"

const Home = () => {
    return (
        <div className="flex flex-wrap gap-5 justify-start py-8">
            <FoodCard
                id="1"
                name="Spaghetti Bolognese"
                rating={4.5}
                isHealthyOption={false}
                cost={1}
                course="Main"
                difficulty={3}
                speed={1}
                ingredients={["Pasta", "Tomato", "Beef"]}
                createdAt={new Date("2025-09-04")}
                updatedAt={null}
            />
            <FoodCard
                id="2"
                name="Spaghetti Bolognese"
                rating={4.5}
                isHealthyOption={true}
                cost={3}
                course="Main"
                difficulty={2}
                speed={2}
                ingredients={["Pasta", "Tomato", "Beef"]}
                createdAt={new Date("2024-10-01")}
                updatedAt={new Date("2025-09-03")}
            />
            <FoodCard
                id="3"
                name="Spaghetti Bolognese"
                rating={4.5}
                isHealthyOption={false}
                cost={2}
                course="Main"
                difficulty={1}
                speed={3}
                ingredients={["Pasta", "Tomato", "Beef"]}
                createdAt={new Date("2024-10-01")}
                updatedAt={new Date("2024-10-03")}
            />
        </div>
    )
}

export default Home

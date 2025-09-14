import {
    BeakerIcon,
    CakeIcon,
    PlusIcon,
    ShoppingCartIcon,
} from "@heroicons/react/16/solid"

interface FloatingActionButtonProps {
    onFoodClick: () => void
    onDrinkClick: () => void
    onIngredientClick: () => void
}

export const FloatingActionButton = ({
    onFoodClick,
    onDrinkClick,
    onIngredientClick
}: FloatingActionButtonProps) => {
    return (
        <div className="fab">
            {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
            <div
                tabIndex={0}
                role="button"
                className="btn btn-lg btn-circle btn-neutral">
                <PlusIcon className="h-6 w-6" />
            </div>

            {/* buttons that show up when FAB is open */}
            <FabItem
                icon={<CakeIcon className="h-6 w-6" />}
                label="Add Food"
                onClick={onFoodClick}
            />
            <FabItem
                icon={<BeakerIcon className="h-6 w-6" />}
                label="Add Drink"
                onClick={onDrinkClick}
            />
            <FabItem
                icon={<ShoppingCartIcon className="h-6 w-6" />}
                label="Add Ingredient"
                onClick={onIngredientClick}
            />
        </div>
    )
}

const FabItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => {
    return (
        <div className="font-bold bg-base-100 p-3 w-48 flex justify-end border rounded-lg shadow-sm" onClick={onClick} role="button">
            {label}
            <button className="btn btn-lg btn-circle mx-2">{icon}</button>
        </div>
    )
}

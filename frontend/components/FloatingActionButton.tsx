import {
    BeakerIcon,
    CakeIcon,
    PlusIcon,
    ShoppingCartIcon,
} from "@heroicons/react/16/solid"
import Link from "next/link"

export const FloatingActionButton = () => {
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
            <FabItem icon={<CakeIcon className="h-6 w-6" />} label="Add Food" link="/add/food" />
            <FabItem
                icon={<BeakerIcon className="h-6 w-6" />}
                label="Add Drink"
                link="/add/drink"
            />
            <FabItem
                icon={<ShoppingCartIcon className="h-6 w-6" />}
                label="Add Ingredient"
                link="/add/ingredient"
            />
        </div>
    )
}

const FabItem = ({ icon, label, link }: { icon: React.ReactNode; label: string, link: string }) => {
    return (
        <div className="font-bold bg-base-100 p-3 w-48 flex justify-end border rounded-lg shadow-sm">
            <Link href={link}>
                {label}
                <button className="btn btn-lg btn-circle mx-2">{icon}</button>
            </Link>
        </div>
    )
}

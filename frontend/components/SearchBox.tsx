import { XMarkIcon } from "@heroicons/react/16/solid"

interface SearchBoxProps {
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchInput?: string
    onClear: () => void
}

export const SearchBox = ({ onSearchChange, searchInput, onClear }: SearchBoxProps) => {
    return (
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
            <legend className="fieldset-legend">Search</legend>
            <div className="relative">
                <input
                    type="text"
                    className="input w-full pr-10"
                    placeholder="eg. Chicken Salad"
                    onChange={onSearchChange}
                    value={searchInput}
                />
                <XMarkIcon 
                    className="h-5 w-5 text-gray-500 cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2" 
                    onClick={onClear} 
                />
            </div>
        </fieldset>
    )
}
    
import { Dispatch, SetStateAction } from "react"

export interface ModalContents {
    label: "Food" | "Drink" | "Ingredient"
    ingredients: boolean

}

interface AddModalProps {
    setShowAddModal: Dispatch<SetStateAction<boolean>>
    modalContents: ModalContents
}

export const AddModal = ({ setShowAddModal, modalContents }: AddModalProps) => {
    return (
        <div className="w-screen h-screen z-100 flex justify-center items-center fixed top-0 left-0 bg-primary-content">
            <div className='bg-white p-4 rounded shadow-md'>
                <h3 className="font-bold text-lg">Add New {modalContents.label}</h3>
                <div className="modal-body">
                    <form className="flex flex-col gap-4">
                        <input type="text" placeholder={`${modalContents.label} Name`} className="input input-bordered w-full" />
                        {modalContents.ingredients && <input type="text" placeholder="Ingredients (comma separated)" className="input input-bordered w-full" />}
                        <input type="number" placeholder="Cost" className="input input-bordered w-full" />
                        <input type="number" placeholder="Rating (1-10)" className="input input-bordered w-full" />
                        <input type="number" placeholder="Speed (1-5)" className="input input-bordered w-full" />
                    </form>
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={() => setShowAddModal(false)}>Add {modalContents.label}</button>
                    <button className="btn" onClick={() => setShowAddModal(false)}>Close</button>
                </div>
            </div>
        </div>
    )
}   
import { COST_LABEL_BY_VALUE, HEALTHY_CHOICE_LABEL } from '@/constants'
import { Ingredient } from '@/models'
import { isNewOrRecentlyUpdated } from '@/utils/isNewOrRecentlyUpdated'
import { Badge } from '../Badge'

interface IngredientCardProps {
  ingredient: Ingredient
  setEditingIngredient: (ingredient: Ingredient) => void
  setPendingDeleteIngredient: (ingredient: Ingredient) => void
}

export const IngredientCard = ({
  ingredient,
  setEditingIngredient,
  setPendingDeleteIngredient,
}: IngredientCardProps) => {
  const newOrUpdated = isNewOrRecentlyUpdated(ingredient.createdAt, ingredient.updatedAt)

  return (
    <div
      key={ingredient.id}
      className="card bg-base-100 w-96 shadow-sm grow border border-base-300"
    >
      <div className="card-body">
        <div className="flex gap-2 flex-wrap">
          <h2 className="card-title">{ingredient.name}</h2>
          {newOrUpdated && <Badge type="new" />}
          {ingredient.isHealthyOption && <Badge type={HEALTHY_CHOICE_LABEL} />}
        </div>

        <div className="divider my-2"></div>

        <p>Rating: {ingredient.rating} / 10</p>
        <p>Cost: {COST_LABEL_BY_VALUE[ingredient.cost]}</p>

        <div className="card-actions justify-start">
          <Badge type={ingredient.macro} />
        </div>

        <div className="card-actions justify-end mt-8">
          <button className="btn btn-outline" onClick={() => setEditingIngredient(ingredient)}>
            Edit
          </button>
          <button
            className="btn btn-outline btn-error"
            onClick={() => setPendingDeleteIngredient(ingredient)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

import { COST_LABEL_BY_VALUE, HEALTHY_CHOICE_LABEL, NEW_LABEL, UPDATED_LABEL } from '@/constants'
import { Ingredient } from '@/models'
import { Badge } from '../Badge'
import { IsNewOrRecentlyUpdated } from '../IsNewOrRecentlyUpdated'
import { Button } from '../Button'

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
  return (
    <div
      key={ingredient.id}
      className="card bg-base-100 w-96 shadow-sm grow border border-base-300"
    >
      <div className="card-body">
        <div className="flex gap-2 flex-wrap">
          <h2 className="card-title">{ingredient.name}</h2>
          {
            <IsNewOrRecentlyUpdated
              createdAt={ingredient.createdAt}
              updatedAt={ingredient.updatedAt}
            />
          }
          {ingredient.isHealthyOption && <Badge type={HEALTHY_CHOICE_LABEL} />}
        </div>

        <div className="divider my-2"></div>

        <p>Rating: {ingredient.rating} / 10</p>
        <p>Cost: {COST_LABEL_BY_VALUE[ingredient.cost]}</p>

        <div className="card-actions justify-start">
          <Badge type={ingredient.macro} />
        </div>

        <div className="card-actions justify-end">
          <Button variant="outline" onClick={() => setEditingIngredient(ingredient)}>
            Edit
          </Button>
          <Button
            variant="outline"
            tone="error"
            onClick={() => setPendingDeleteIngredient(ingredient)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

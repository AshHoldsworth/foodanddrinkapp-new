'use client'

import { Error } from '@/components/Error'
import Loading from '@/components/Loading'
import { getMealById } from '@/app/api/mealApi'
import { costMapping, difficultyMapping, speedMapping } from '@/utils/mealMappings'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Meal } from '@/models/meal'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { getMacroBadgeClass } from '@/utils/macroBadge'

const getMacroOrder = (macro?: Meal['ingredients'][number]['macro']) => {
  if (macro === 'Protein') return 0
  if (macro === 'Carbs') return 1
  if (macro === 'Fat') return 2
  if (macro === 'Vegetable') return 3
  return 4
}

const MealPage = () => {
  const params = useParams()
  const id = params.id as string

  const [meal, setMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true)
      setError(null)

      const { meal: data, error: fetchError } = await getMealById(id)
      setMeal(data)
      setError(fetchError)
      setLoading(false)
    }

    if (id) {
      fetchMeal()
    }
  }, [id])

  if (loading) {
    return (
      <div className="my-20 flex justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !meal) {
    return (
      <div className="my-20">
        <Error
          title="Error"
          message={error ?? 'Meal not found'}
          onRetry={async () => window.location.reload()}
        />
      </div>
    )
  }

  const orderedIngredients = meal.ingredients
    .map((ingredient, originalIndex) => ({ ingredient, originalIndex }))
    .sort((a, b) => {
      const macroOrderDifference =
        getMacroOrder(a.ingredient.macro) - getMacroOrder(b.ingredient.macro)
      if (macroOrderDifference !== 0) return macroOrderDifference

      const nameDifference = a.ingredient.name.localeCompare(b.ingredient.name)
      if (nameDifference !== 0) return nameDifference

      return a.originalIndex - b.originalIndex
    })

  return (
    <div className="mx-5 my-8">
      <div className="mb-4">
        <button className="btn btn-square" onClick={() => window.history.back()}>
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="card bg-base-100 border-base-300">
        <Image
          src={meal.imagePath ? `/backend${meal.imagePath}` : '/meal-placeholder.png'}
          alt={meal.name}
          width={600}
          height={400}
          className="w-full"
        />

        <div className="card-body">
          <h1 className="card-title text-3xl">{meal.name}</h1>

          <div className="flex flex-wrap gap-2 mb-2">
            <div className="badge badge-outline badge-primary">{meal.course}</div>
            {meal.isHealthyOption && (
              <div className="badge badge-outline badge-success">Healthy Choice</div>
            )}
          </div>

          <p>Rating: {meal.rating} / 10</p>
          <p>Difficulty: {difficultyMapping[meal.difficulty]}</p>
          <p>Speed: {speedMapping[meal.speed]}</p>
          <p>Cost: {costMapping[meal.cost]}</p>

          <div className="divider my-2" />

          <h2 className="font-semibold">Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {orderedIngredients.map(({ ingredient, originalIndex }) => {
              const badgeClass = getMacroBadgeClass(ingredient.macro)

              return (
                <div key={`${ingredient.name}-${originalIndex}`} className={`badge ${badgeClass}`}>
                  {ingredient.name}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MealPage

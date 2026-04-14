'use client'

import { Error } from '@/components/Error'
import Loading from '@/components/Loading'
import { getFoodById } from '@/app/api/foodApi'
import { costMapping, difficultyMapping, speedMapping } from '@/utils/foodMappings'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Food } from '@/models/food'

const FoodPage = () => {
  const params = useParams()
  const id = params.id as string

  const [food, setFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFood = async () => {
      setLoading(true)
      setError(null)

      const { food: data, error: fetchError } = await getFoodById(id)
      setFood(data)
      setError(fetchError)
      setLoading(false)
    }

    if (id) {
      fetchFood()
    }
  }, [id])

  if (loading) {
    return (
      <div className="my-20 flex justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !food) {
    return (
      <div className="my-20">
        <Error
          title="Error"
          message={error ?? 'Food not found'}
          onRetry={async () => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="mx-5 my-8">
      <div className="mb-4">
        <Link href="/" className="link link-primary">
          Back to all food
        </Link>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <figure>
          <Image
            src={food.imagePath ? `/backend${food.imagePath}` : '/food-placeholder.png'}
            alt={food.name}
            width={1200}
            height={600}
            className="w-full h-64 object-cover"
          />
        </figure>

        <div className="card-body">
          <h1 className="card-title text-3xl">{food.name}</h1>

          <div className="flex flex-wrap gap-2 mb-2">
            <div className="badge badge-outline badge-primary">{food.course}</div>
            {food.isHealthyOption && (
              <div className="badge badge-outline badge-success">Healthy Choice</div>
            )}
          </div>

          <p>Rating: {food.rating} / 10</p>
          <p>Difficulty: {difficultyMapping[food.difficulty]}</p>
          <p>Speed: {speedMapping[food.speed]}</p>
          <p>Cost: {costMapping[food.cost]}</p>

          <div className="divider my-2" />

          <h2 className="font-semibold">Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {food.ingredients.map((ingredient) => (
              <div key={ingredient} className="badge badge-soft">
                {ingredient}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodPage

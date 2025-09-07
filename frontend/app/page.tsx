'use client';

import { useState, useEffect } from 'react';
import { Food } from '@/types';
import { foodApi } from '@/lib/api';
import { getCostRating, getDifficultyLabel, getSpeedLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Utensils, Star, PoundSterling, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const foodList = await foodApi.getAllFood();
      setFoods(foodList);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      toast.error('Failed to load foods');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Food & Drink Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your food recipes and ingredients
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
          >
            <Utensils className="h-4 w-4" />
            View Ingredients
          </Link>
          <Link
            href="/ingredients/add"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Link>
          <Link
            href="/foods/add"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Food
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Food grid */}
      {!loading && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {foods.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Utensils className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No foods</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new food recipe.</p>
              <div className="mt-6">
                <Link
                  href="/foods/add"
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Food
                </Link>
              </div>
            </div>
          ) : (
            foods.map((food) => (
              <div
                key={food.id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
                    {food.isHealthyOption && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Healthy
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>Rating: {food.rating}/10</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <PoundSterling className="h-4 w-4 mr-2 text-green-500" />
                      <span>Cost: {getCostRating(food.cost)}</span>
                    </div>                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Speed: {getSpeedLabel(food.speed)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Difficulty: {getDifficultyLabel(food.difficulty)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {food.course}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{food.ingredients.length}</span> ingredients
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3">
                  <Link
                    href={`/foods/${food.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

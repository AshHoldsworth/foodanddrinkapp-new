'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Food } from '@/types';
import { foodApi } from '@/lib/api';
import { getCostRating, getDifficultyLabel, getSpeedLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, PoundSterling, Clock, TrendingUp, Users, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function FoodDetail() {
  const params = useParams();
  const router = useRouter();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFood = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const foodData = await foodApi.getFoodById(id);
      if (foodData) {
        setFood(foodData);
      } else {
        toast.error('Food not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch food:', error);
      toast.error('Failed to load food details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      fetchFood(params.id as string);
    }
  }, [params.id, fetchFood]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Utensils className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Food not found</h3>
          <p className="mt-1 text-sm text-gray-500">The food you&apos;re looking for doesn&apos;t exist.</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{food.name}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
                    {food.course}
                  </span>
                  {food.isHealthyOption && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                      Healthy Option
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="text-center">
                <div className="flex justify-center">
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-gray-900">{food.rating}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <PoundSterling className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-gray-900">{getCostRating(food.cost)}</p>
                  <p className="text-sm text-gray-600">Cost</p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-gray-900">{getSpeedLabel(food.speed)}</p>
                  <p className="text-sm text-gray-600">Speed</p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-semibold text-gray-900">{getDifficultyLabel(food.difficulty)}</p>
                  <p className="text-sm text-gray-600">Difficulty</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="px-6 py-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Ingredients ({food.ingredients.length})
              </h2>
            </div>

            {food.ingredients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No ingredients listed for this food.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {food.ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
                      {ingredient.isHealthyOption && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Healthy
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Macro:</span>
                        <span className="font-medium">{ingredient.macro}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rating:</span>
                        <span className="font-medium">{ingredient.rating}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cost:</span>
                        <span className="font-medium">${ingredient.cost}</span>
                      </div>
                    </div>

                    {ingredient.barcodes && ingredient.barcodes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Barcodes:</p>
                        <div className="space-y-1">
                          {ingredient.barcodes.slice(0, 2).map((barcode, index) => (
                            <p key={index} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {barcode}
                            </p>
                          ))}
                          {ingredient.barcodes.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{ingredient.barcodes.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <Link
                href={`/foods/${food.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Food
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

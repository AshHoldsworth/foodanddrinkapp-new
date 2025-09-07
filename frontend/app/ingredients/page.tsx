'use client';

import { useState, useEffect } from 'react';
import { Ingredient } from '@/types';
import { ingredientApi } from '@/lib/api';
import { getCostRating } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Package, Star, PoundSterling, Leaf, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientApi.getAllIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
      toast.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
              <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Ingredients
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all your ingredients including their ratings and nutritional information.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
            <Link
              href="/"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <Utensils className="h-4 w-4" />
              View Foods
            </Link>
            <Link
              href="/ingredients/add"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Link>
          </div>
        </div>

      {/* Ingredients Grid */}
      <div className="mt-8">
        {ingredients.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No ingredients</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first ingredient.</p>
            <div className="mt-6">
              <Link
                href="/ingredients/add"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
              >
                <Plus className="h-4 w-4" />
                Add Ingredient
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-900/5 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {ingredient.name}
                    </h3>
                    {ingredient.isHealthyOption && (
                      <Leaf className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>Rating: {ingredient.rating}/10</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <PoundSterling className="h-4 w-4 mr-2 text-green-500" />
                      <span>Cost: {getCostRating(ingredient.cost)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Macro: {ingredient.macro}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {ingredient.macro}
                    </span>
                    {ingredient.isHealthyOption && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Healthy
                      </span>
                    )}
                  </div>

                  {ingredient.barcodes && ingredient.barcodes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">
                        Barcodes: {ingredient.barcodes.slice(0, 2).join(', ')}
                        {ingredient.barcodes.length > 2 && ` +${ingredient.barcodes.length - 2} more`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

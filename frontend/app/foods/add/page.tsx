'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { foodApi, ingredientApi } from '@/lib/api';
import { AddFoodRequest, Ingredient, AddIngredientRequest } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { courseOptions, costOptionsShort, difficultyOptions, speedOptions } from '@/lib/constants';
import { IngredientSelector, type IngredientLineState } from '@/components/forms/IngredientSelector';

export default function AddFood() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<AddFoodRequest, 'ingredients'> & { ingredients: IngredientLineState[] }>({
    name: '',
    rating: 5,
    isHealthyOption: false,
    cost: 1, // 1 = cheap, 2 = moderate, 3 = expensive
    course: '',
    difficulty: 1, // 1 = Easy, 2 = Medium, 3 = Hard
    speed: 1, // 1 = Quick, 2 = Medium, 3 = Slow
    ingredients: [{ type: 'existing', existingId: '', displayOrder: 1 }],
  });

  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);

  // Fetch available ingredients on component mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const ingredients = await ingredientApi.getAllIngredients();
        setAvailableIngredients(ingredients);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        toast.error('Failed to load ingredients');
      }
    };

    fetchIngredients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process ingredients and validate
    const processedIngredients: Ingredient[] = [];
    
    for (const ingredientItem of formData.ingredients) {
      if (ingredientItem.type === 'existing' && ingredientItem.existingId) {
        const ingredient = availableIngredients.find(ing => ing.id === ingredientItem.existingId);
        if (ingredient) {
          processedIngredients.push(ingredient);
        }
      } else if (ingredientItem.type === 'new' && ingredientItem.newIngredient) {
        const { name, rating, isHealthyOption, cost, macro } = ingredientItem.newIngredient;
        if (name.trim() && macro) {
          try {
            // Create new ingredient in database
            const newIngredientRequest: AddIngredientRequest = {
              name: name.trim(),
              rating,
              isHealthyOption,
              cost,
              macro
            };
            
            const createdIngredient = await ingredientApi.addIngredient(newIngredientRequest);
            processedIngredients.push(createdIngredient);
            
            // Add to available ingredients list for future use
            setAvailableIngredients(prev => [...prev, createdIngredient]);
          } catch (error) {
            console.error('Failed to create ingredient:', error);
            toast.error(`Failed to create ingredient: ${name}`);
            return;
          }
        }
      }
    }
    
    if (processedIngredients.length === 0) {
      toast.error('Please select or add at least one ingredient');
      return;
    }

    try {
      setLoading(true);
      const foodRequest: AddFoodRequest = {
        ...formData,
        ingredients: processedIngredients,
      };

      await foodApi.addFood(foodRequest);
      toast.success('Food added successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to add food:', error);
      toast.error('Failed to add food');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">Add New Food</h1>
            <p className="mt-1 text-sm text-gray-600">Create a new food recipe with ingredients</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Food Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Food Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Spaghetti Carbonara"
                />
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <select
                  id="course"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select a course</option>
                  {courseOptions.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="10"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                  Cost Rating
                </label>
                <select
                  id="cost"
                  required
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {costOptionsShort.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {difficultyOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="speed" className="block text-sm font-medium text-gray-700">
                  Speed
                </label>
                <select
                  id="speed"
                  required
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {speedOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="isHealthyOption"
                type="checkbox"
                checked={formData.isHealthyOption}
                onChange={(e) => setFormData(prev => ({ ...prev, isHealthyOption: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isHealthyOption" className="ml-2 block text-sm text-gray-900">
                Healthy Option
              </label>
            </div>

            {/* Ingredients Section */}
            <div>
              <IngredientSelector
                value={formData.ingredients}
                onChange={(ingredients) => setFormData(prev => ({ ...prev, ingredients }))}
                initialIngredients={availableIngredients}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Food'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

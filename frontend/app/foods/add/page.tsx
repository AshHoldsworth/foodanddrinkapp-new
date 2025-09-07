'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { foodApi, ingredientApi } from '@/lib/api';
import { AddFoodRequest, Ingredient, AddIngredientRequest } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Star } from 'lucide-react';
import Link from 'next/link';

export default function AddFood() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [formData, setFormData] = useState<Omit<AddFoodRequest, 'ingredients'> & { 
    ingredients: Array<{
      type: 'existing' | 'new';
      existingId?: string;
      newIngredient?: {
        name: string;
        rating: number;
        isHealthyOption: boolean;
        cost: number;
        macro: string;
      };
    }>
  }>({
    name: '',
    rating: 5,
    isHealthyOption: false,
    cost: 1, // 1 = cheap, 2 = moderate, 3 = expensive
    course: '',
    difficulty: 5,
    speed: 5,
    ingredients: [{ type: 'existing', existingId: '' }], // Start with one empty ingredient slot
  });

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

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { type: 'existing', existingId: '' }],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const toggleIngredientType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index 
          ? ing.type === 'existing' 
            ? { type: 'new', newIngredient: { name: '', rating: 5, isHealthyOption: false, cost: 1, macro: '' } }
            : { type: 'existing', existingId: '' }
          : ing
      ),
    }));
  };

  const updateExistingIngredient = (index: number, ingredientId: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, existingId: ingredientId } : ing
      ),
    }));
  };

  const updateNewIngredient = (index: number, field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index && ing.type === 'new' && ing.newIngredient
          ? { ...ing, newIngredient: { ...ing.newIngredient, [field]: value } }
          : ing
      ),
    }));
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
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Side Dish">Side Dish</option>
                  <option value="Snack">Snack</option>
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
                  <option value={1}>1 - Cheap</option>
                  <option value={2}>2 - Moderate</option>
                  <option value={3}>3 - Expensive</option>
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
                  <option value={1}>1 - Very Easy</option>
                  <option value={2}>2 - Easy</option>
                  <option value={3}>3 - Easy-Medium</option>
                  <option value={4}>4 - Medium</option>
                  <option value={5}>5 - Medium</option>
                  <option value={6}>6 - Medium-Hard</option>
                  <option value={7}>7 - Hard</option>
                  <option value={8}>8 - Hard</option>
                  <option value={9}>9 - Very Hard</option>
                  <option value={10}>10 - Expert</option>
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
                  <option value={1}>1 - Very Slow</option>
                  <option value={2}>2 - Slow</option>
                  <option value={3}>3 - Slow-Medium</option>
                  <option value={4}>4 - Medium</option>
                  <option value={5}>5 - Medium</option>
                  <option value={6}>6 - Medium-Fast</option>
                  <option value={7}>7 - Fast</option>
                  <option value={8}>8 - Fast</option>
                  <option value={9}>9 - Very Fast</option>
                  <option value={10}>10 - Lightning</option>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Ingredient
                </button>
              </div>

              <div className="space-y-4">
                {formData.ingredients.map((ingredientItem, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-medium text-gray-700">Ingredient {index + 1}</h4>
                        <div className="flex rounded-md shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleIngredientType(index)}
                            className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
                              ingredientItem.type === 'existing'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            Select Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleIngredientType(index)}
                            className={`px-3 py-1 text-xs font-medium rounded-r-md border-t border-r border-b ${
                              ingredientItem.type === 'new'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            Create New
                          </button>
                        </div>
                      </div>
                      
                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {ingredientItem.type === 'existing' ? (
                      // Existing ingredient selection
                      <div>
                        {availableIngredients.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">No ingredients available. Create a new ingredient instead.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <select
                              value={ingredientItem.existingId || ''}
                              onChange={(e) => updateExistingIngredient(index, e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Select an ingredient</option>
                              {availableIngredients.map((ingredient) => (
                                <option key={ingredient.id} value={ingredient.id}>
                                  {ingredient.name} ({ingredient.macro}) - Rating: {ingredient.rating}
                                </option>
                              ))}
                            </select>
                            
                            {ingredientItem.existingId && (() => {
                              const selectedIngredient = availableIngredients.find(ing => ing.id === ingredientItem.existingId);
                              return selectedIngredient ? (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-400" />
                                    {selectedIngredient.rating}
                                  </span>
                                  <span>{selectedIngredient.macro}</span>
                                  {selectedIngredient.isHealthyOption && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Healthy
                                    </span>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      // New ingredient creation form
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              value={ingredientItem.newIngredient?.name || ''}
                              onChange={(e) => updateNewIngredient(index, 'name', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                              placeholder="e.g., Tomatoes"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700">Macro Type</label>
                            <select
                              value={ingredientItem.newIngredient?.macro || ''}
                              onChange={(e) => updateNewIngredient(index, 'macro', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                              <option value="">Select macro</option>
                              <option value="Protein">Protein</option>
                              <option value="Carbohydrate">Carbohydrate</option>
                              <option value="Fat">Fat</option>
                              <option value="Vegetable">Vegetable</option>
                              <option value="Fruit">Fruit</option>
                              <option value="Spice">Spice</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700">Rating (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={ingredientItem.newIngredient?.rating || 5}
                              onChange={(e) => updateNewIngredient(index, 'rating', parseInt(e.target.value))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700">Cost Rating</label>
                            <select
                              value={ingredientItem.newIngredient?.cost || 1}
                              onChange={(e) => updateNewIngredient(index, 'cost', parseInt(e.target.value))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                              <option value={1}>1 - Cheap</option>
                              <option value={2}>2 - Moderate</option>
                              <option value={3}>3 - Expensive</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={ingredientItem.newIngredient?.isHealthyOption || false}
                              onChange={(e) => updateNewIngredient(index, 'isHealthyOption', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-xs text-gray-900">Healthy ingredient</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {formData.ingredients.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No ingredients added yet. Click &quot;Add Ingredient&quot; to get started.</p>
                  </div>
                )}
              </div>
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

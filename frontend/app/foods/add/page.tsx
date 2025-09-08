'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { foodApi, ingredientApi } from '@/lib/api';
import { AddFoodRequest, Ingredient, AddIngredientRequest } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AddFood() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [formData, setFormData] = useState<Omit<AddFoodRequest, 'ingredients'> & { 
    ingredients: Array<{
      type: 'existing' | 'new';
      displayOrder: number; // persistent display number
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
    difficulty: 1, // 1 = Easy, 2 = Medium, 3 = Hard
    speed: 1, // 1 = Quick, 2 = Medium, 3 = Slow
    ingredients: [{ type: 'existing', existingId: '', displayOrder: 1 }], // Start with one ingredient slot
  });

  // Revert filters to simple version (query, macro, healthyOnly)
  const [ingredientFilters, setIngredientFilters] = useState<Array<{ query: string; macro: string; healthyOnly: boolean }>>([
    { query: '', macro: '', healthyOnly: false }
  ]);

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

  // Sync ingredientFilters with length (simple shape)
  useEffect(() => {
    setIngredientFilters(prev => {
      const diff = formData.ingredients.length - prev.length;
      if (diff > 0) {
        return [
          ...prev,
          ...Array.from({ length: diff }, () => ({ query: '', macro: '', healthyOnly: false }))
        ];
      } else if (diff < 0) {
        return prev.slice(0, formData.ingredients.length);
      }
      return prev;
    });
  }, [formData.ingredients.length]);

  const updateIngredientFilter = (index: number, patch: Partial<{ query: string; macro: string; healthyOnly: boolean }>) => {
    setIngredientFilters(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f));
  };

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
    setFormData(prev => {
      const nextDisplayOrder = prev.ingredients.reduce((m, ing) => Math.max(m, ing.displayOrder), 0) + 1;
      return {
        ...prev,
        ingredients: [
          { type: 'existing', existingId: '', displayOrder: nextDisplayOrder },
          ...prev.ingredients,
        ],
      };
    });
    setIngredientFilters(prev => [ { query: '', macro: '', healthyOnly: false }, ...prev ]);
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // New explicit setter for ingredient type (improves UX over toggle)
  const setIngredientType = (index: number, type: 'existing' | 'new') => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index
          ? type === 'existing'
            ? { type: 'existing', existingId: '', displayOrder: ing.displayOrder }
            : { type: 'new', displayOrder: ing.displayOrder, newIngredient: { name: '', rating: 5, isHealthyOption: false, cost: 1, macro: '' } }
          : ing
      ),
    }));
  };

  const updateExistingIngredient = (index: number, ingredientId: string) => {
    // Prevent duplicate selection
    const alreadyUsed = formData.ingredients.some((ing, i) => i !== index && ing.type === 'existing' && ing.existingId === ingredientId);
    if (alreadyUsed) {
      toast.error('Ingredient already selected');
      return;
    }
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
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
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
                  <option value={1}>Cheap</option>
                  <option value={2}>Moderate</option>
                  <option value={3}>Expensive</option>
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
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
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
                  <option value={1}>Quick</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Slow</option>
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
                  <div key={ingredientItem.displayOrder} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-medium text-gray-700">Ingredient {ingredientItem.displayOrder}</h4>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setIngredientType(index, 'existing')}
                            aria-pressed={ingredientItem.type === 'existing'}
                            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                              ingredientItem.type === 'existing'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Select Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => setIngredientType(index, 'new')}
                            aria-pressed={ingredientItem.type === 'new'}
                            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                              ingredientItem.type === 'new'
                                ? 'bg-green-50 text-green-700 border-green-300'
                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="relative col-span-1 sm:col-span-1">
                                <input
                                  type="text"
                                  placeholder="Search..."
                                  value={ingredientFilters[index]?.query || ''}
                                  onChange={(e) => updateIngredientFilter(index, { query: e.target.value })}
                                  className="w-full pl-3 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <select
                                  value={ingredientFilters[index]?.macro || ''}
                                  onChange={(e) => updateIngredientFilter(index, { macro: e.target.value })}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">All Macros</option>
                                  <option value="Protein">Protein</option>
                                  <option value="Carbohydrate">Carbohydrate</option>
                                  <option value="Fat">Fat</option>
                                  <option value="Vegetable">Vegetable</option>
                                  <option value="Fruit">Fruit</option>
                                  <option value="Spice">Spice</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-1">
                                <input
                                  id={`healthy-filter-${index}`}
                                  type="checkbox"
                                  checked={ingredientFilters[index]?.healthyOnly || false}
                                  onChange={(e) => updateIngredientFilter(index, { healthyOnly: e.target.checked })}
                                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor={`healthy-filter-${index}`} className="text-xs text-gray-600">Healthy</label>
                              </div>
                            </div>
                            {(() => {
                              const filterState = ingredientFilters[index] || { query: '', macro: '', healthyOnly: false };
                              let filtered = availableIngredients;
                              if (filterState.query) {
                                const q = filterState.query.toLowerCase();
                                filtered = filtered.filter(ing => ing.name.toLowerCase().includes(q));
                              }
                              if (filterState.macro) {
                                filtered = filtered.filter(ing => ing.macro === filterState.macro);
                              }
                              if (filterState.healthyOnly) {
                                filtered = filtered.filter(ing => ing.isHealthyOption);
                              }
                              return (
                                <select
                                  value={ingredientItem.existingId || ''}
                                  onChange={(e) => updateExistingIngredient(index, e.target.value)}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                  <option value="">Select an ingredient</option>
                                  {filtered.map((ingredient) => (
                                    <option
                                      key={ingredient.id}
                                      value={ingredient.id}
                                      disabled={ingredientItem.existingId !== ingredient.id && formData.ingredients.some((ing, i) => i !== index && ing.type === 'existing' && ing.existingId === ingredient.id)}
                                    >
                                      {ingredient.name} ({ingredient.macro}){ingredient.isHealthyOption ? ' • Healthy' : ''} - Rating: {ingredient.rating}
                                    </option>
                                  ))}
                                </select>
                              );
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
                              <option value={1}>Cheap</option>
                              <option value={2}>Moderate</option>
                              <option value={3}>Expensive</option>
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

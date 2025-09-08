'use client';

import { useState, useEffect } from 'react';
import { Food, Ingredient } from '@/types';
import { foodApi, ingredientApi } from '@/lib/api';
import { getCostRating, getDifficultyLabel, getSpeedLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Utensils, Star, PoundSterling, Clock, TrendingUp, Trash2, Edit, Leaf, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { courseOptions, difficultyOptions, speedOptions, costOptionsShort } from '@/lib/constants';

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSpeed, setSelectedSpeed] = useState('');
  const [selectedCost, setSelectedCost] = useState('');
  const [healthyOnly, setHealthyOnly] = useState(false);
  // Ingredient filter state
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);

  useEffect(() => {
    fetchFoods();
    fetchIngredients();
  }, []);

  useEffect(() => {
    let filtered = [...foods];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter(food => food.course === selectedCourse);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(food => food.difficulty === Number(selectedDifficulty));
    }

    // Filter by speed
    if (selectedSpeed) {
      filtered = filtered.filter(food => food.speed === Number(selectedSpeed));
    }

    // Filter by cost
    if (selectedCost) {
      filtered = filtered.filter(food => food.cost === Number(selectedCost));
    }

    // Filter by healthy option
    if (healthyOnly) {
      filtered = filtered.filter(food => food.isHealthyOption);
    }
    // Filter by selected ingredients (AND logic: food must include all selected ingredients)
    if (selectedIngredientIds.length > 0) {
      filtered = filtered.filter(food =>
        selectedIngredientIds.every(id => food.ingredients.some(i => i.id === id))
      );
    }
    setFilteredFoods(filtered);
  }, [foods, searchTerm, selectedCourse, selectedDifficulty, selectedSpeed, selectedCost, healthyOnly, selectedIngredientIds]);

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

  const fetchIngredients = async () => {
    try {
      const list = await ingredientApi.getAllIngredients();
      setAllIngredients(list);
    } catch (e) {
      console.error('Failed to fetch ingredients for filter', e);
    }
  };

  const handleDeleteFood = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await foodApi.deleteFood(id);
      setFoods(prev => prev.filter(food => food.id !== id));
      toast.success(`${name} has been deleted`);
    } catch (error) {
      console.error('Failed to delete food:', error);
      toast.error('Failed to delete food');
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
            href="/foods/add"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Food
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Search & Filter</h3>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search food by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Courses</option>
              {courseOptions.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Difficulties</option>
              {difficultyOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Speed Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
            <select
              value={selectedSpeed}
              onChange={(e) => setSelectedSpeed(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Speeds</option>
              {speedOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Cost Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
            <select
              value={selectedCost}
              onChange={(e) => setSelectedCost(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Costs</option>
              {costOptionsShort.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Healthy Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Healthy Options</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={healthyOnly}
                onChange={(e) => setHealthyOnly(e.target.checked)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Healthy only</span>
            </label>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCourse('');
                setSelectedDifficulty('');
                setSelectedSpeed('');
                setSelectedCost('');
                setHealthyOnly(false);
                setSelectedIngredientIds([]);
                setIngredientQuery('');
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Ingredient Filter Section */}
        <div className="mt-6 border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Ingredients (must contain all)</label>
          <div className="relative">
            <input
              type="text"
              value={ingredientQuery}
              onChange={(e) => setIngredientQuery(e.target.value)}
              placeholder="Type to search ingredients..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {ingredientQuery && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-56 overflow-auto text-sm">
                {allIngredients
                  .filter(i => i.name.toLowerCase().includes(ingredientQuery.toLowerCase()) && !selectedIngredientIds.includes(i.id))
                  .slice(0, 30)
                  .map(i => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => {
                        setSelectedIngredientIds(prev => [...prev, i.id]);
                        setIngredientQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>{i.name}</span>
                      <span className="text-xs text-gray-500">{i.macro}</span>
                    </button>
                  ))}
                {allIngredients.filter(i => i.name.toLowerCase().includes(ingredientQuery.toLowerCase()) && !selectedIngredientIds.includes(i.id)).length === 0 && (
                  <div className="px-3 py-2 text-gray-500">No matches</div>
                )}
              </div>
            )}
          </div>
          {/* Selected ingredient chips */}
          {selectedIngredientIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedIngredientIds.map(id => {
                const ing = allIngredients.find(a => a.id === id);
                if (!ing) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {ing.name}
                    <button
                      type="button"
                      onClick={() => setSelectedIngredientIds(prev => prev.filter(pid => pid !== id))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      aria-label={`Remove ${ing.name}`}
                    >×</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Results count */}
      {!loading && foods.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredFoods.length}</span> of <span className="font-medium">{foods.length}</span> foods
          </p>
        </div>
      )}

      {/* Food grid */}
      {!loading && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFoods.length === 0 && foods.length > 0 ? (
            <div className="col-span-full text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching foods</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters to find what you&apos;re looking for.</p>
            </div>
          ) : filteredFoods.length === 0 ? (
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
            filteredFoods.map((food) => (
              <Link key={food.id} href={`/foods/${food.id}`}>
                <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
                      <div className="flex items-center gap-2">
                        {food.isHealthyOption && (
                          <Leaf className="h-5 w-5 text-green-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/foods/${food.id}/edit`;
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded z-10 relative"
                          title={`Edit ${food.name}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteFood(food.id, food.name);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded z-10 relative"
                          title={`Delete ${food.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
                        {food.course.charAt(0).toUpperCase() + food.course.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{food.ingredients.length}</span> ingredients
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3">
                    <span className="text-sm font-medium text-blue-600">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

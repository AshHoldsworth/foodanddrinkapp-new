'use client';

import { useState, useEffect } from 'react';
import { Ingredient } from '@/types';
import { ingredientApi } from '@/lib/api';
import { getCostRating } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Package, Star, PoundSterling, Leaf, Utensils, Trash2, Search, Filter, Pencil, X, Check } from 'lucide-react';
import Link from 'next/link';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCost, setSelectedCost] = useState('');
  const [healthyOnly, setHealthyOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Partial<Ingredient>>({});

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    let filtered = [...ingredients];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by cost
    if (selectedCost) {
      filtered = filtered.filter(ingredient => ingredient.cost === Number(selectedCost));
    }

    // Filter by healthy option
    if (healthyOnly) {
      filtered = filtered.filter(ingredient => ingredient.isHealthyOption);
    }

    setFilteredIngredients(filtered);
  }, [ingredients, searchTerm, selectedCost, healthyOnly]);

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

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await ingredientApi.deleteIngredient(id);
      setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
      toast.success(`${name} has been deleted`);
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  const startEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditingDraft({ ...ingredient });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await ingredientApi.updateIngredient({
        id: editingId,
        name: editingDraft.name,
        rating: editingDraft.rating,
        isHealthyOption: editingDraft.isHealthyOption,
        cost: editingDraft.cost,
        macro: editingDraft.macro,
      });
      setIngredients(prev => prev.map(i => i.id === editingId ? { ...i, ...(editingDraft as Ingredient) } : i));
      toast.success('Ingredient updated');
      setEditingId(null);
      setEditingDraft({});
    } catch (e) {
      console.error('Failed to update ingredient', e);
      toast.error('Failed to update ingredient');
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
              placeholder="Search ingredients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cost Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
            <select
              value={selectedCost}
              onChange={(e) => setSelectedCost(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Costs</option>
              <option value="1">£ - Budget</option>
              <option value="2">££ - Moderate</option>
              <option value="3">£££ - Expensive</option>
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
                setSelectedCost('');
                setHealthyOnly(false);
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {ingredients.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredIngredients.length}</span> of <span className="font-medium">{ingredients.length}</span> ingredients
          </p>
        </div>
      )}

      {/* Ingredients Grid */}
      <div className="mt-8">
        {filteredIngredients.length === 0 && ingredients.length > 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No matching ingredients</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        ) : filteredIngredients.length === 0 ? (
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
            {filteredIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-900/5 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {editingId === ingredient.id ? (
                      <input
                        type="text"
                        value={editingDraft.name || ''}
                        onChange={e => setEditingDraft(d => ({ ...d, name: e.target.value }))}
                        className="text-lg font-semibold text-gray-900 truncate border px-2 py-1 rounded w-full mr-3"
                        placeholder="Name"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {ingredient.name}
                      </h3>
                    )}
                    <div className="flex items-center gap-2">
                      {ingredient.isHealthyOption && editingId !== ingredient.id && (
                        <Leaf className="h-5 w-5 text-green-500" />
                      )}
                      {editingId === ingredient.id ? (
                        <>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-700 p-1 rounded"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(ingredient)}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded"
                            title={`Edit ${ingredient.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(ingredient.id, ingredient.name)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                            title={`Delete ${ingredient.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingId === ingredient.id ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Macro</label>
                          <select
                            value={editingDraft.macro || ''}
                            onChange={e => setEditingDraft(d => ({ ...d, macro: e.target.value }))}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">Select</option>
                            <option value="Protein">Protein</option>
                            <option value="Carbohydrate">Carbohydrate</option>
                            <option value="Fat">Fat</option>
                            <option value="Vegetable">Vegetable</option>
                            <option value="Fruit">Fruit</option>
                            <option value="Spice">Spice</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Rating (1-10)</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={editingDraft.rating || 1}
                            onChange={e => setEditingDraft(d => ({ ...d, rating: parseInt(e.target.value) }))}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
                          <select
                            value={editingDraft.cost || 1}
                            onChange={e => setEditingDraft(d => ({ ...d, cost: parseInt(e.target.value) }))}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value={1}>Cheap</option>
                            <option value={2}>Moderate</option>
                            <option value={3}>Expensive</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            <input
                              type="checkbox"
                              checked={editingDraft.isHealthyOption || false}
                              onChange={e => setEditingDraft(d => ({ ...d, isHealthyOption: e.target.checked }))}
                              className="h-4 w-4 text-green-600 border-gray-300 rounded"
                            />
                            Healthy
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
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
                      </div>
                      {ingredient.barcodes && ingredient.barcodes.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">
                            Barcodes: {ingredient.barcodes.slice(0, 2).join(', ')}
                            {ingredient.barcodes.length > 2 && ` +${ingredient.barcodes.length - 2} more`}
                          </p>
                        </div>
                      )}
                    </>
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

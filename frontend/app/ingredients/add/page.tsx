'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ingredientApi } from '@/lib/api';
import { AddIngredientRequest } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AddIngredient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddIngredientRequest>({
    name: '',
    rating: 5,
    isHealthyOption: false,
    cost: 1, // 1 = cheap, 2 = moderate, 3 = expensive
    macro: '',
    barcodes: [],
  });
  const [newBarcode, setNewBarcode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await ingredientApi.addIngredient(formData);
      toast.success('Ingredient added successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to add ingredient:', error);
      toast.error('Failed to add ingredient');
    } finally {
      setLoading(false);
    }
  };

  const addBarcode = () => {
    if (newBarcode.trim()) {
      setFormData(prev => ({
        ...prev,
        barcodes: [...(prev.barcodes || []), newBarcode.trim()],
      }));
      setNewBarcode('');
    }
  };

  const removeBarcode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      barcodes: prev.barcodes?.filter((_, i) => i !== index) || [],
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
            <h1 className="text-lg font-semibold text-gray-900">Add New Ingredient</h1>
            <p className="mt-1 text-sm text-gray-600">Create a new ingredient for use in recipes</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Tomatoes"
                />
              </div>

              <div>
                <label htmlFor="macro" className="block text-sm font-medium text-gray-700">
                  Macro Type
                </label>
                <select
                  id="macro"
                  required
                  value={formData.macro}
                  onChange={(e) => setFormData(prev => ({ ...prev, macro: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select a macro type</option>
                  <option value="Protein">Protein</option>
                  <option value="Carbohydrate">Carbohydrate</option>
                  <option value="Fat">Fat</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Spice">Spice</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grain">Grain</option>
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

            {/* Barcodes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Barcodes (Optional)
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  placeholder="Enter barcode"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBarcode();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addBarcode}
                  className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {formData.barcodes && formData.barcodes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Added barcodes:</p>
                  <div className="space-y-1">
                    {formData.barcodes.map((barcode, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm font-mono">{barcode}</span>
                        <button
                          type="button"
                          onClick={() => removeBarcode(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Ingredient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

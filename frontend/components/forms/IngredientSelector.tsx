"use client";
import { useState, useEffect } from 'react';
import { Ingredient, AddIngredientRequest } from '@/types';
import { ingredientApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { MacroSelect } from './Select';

export interface IngredientLineState {
  type: 'existing' | 'new';
  displayOrder: number;
  existingId?: string;
  newIngredient?: {
    name: string;
    rating: number;
    isHealthyOption: boolean;
    cost: number;
    macro: string;
  };
}

interface IngredientSelectorProps {
  value: IngredientLineState[];
  onChange: (value: IngredientLineState[]) => void;
  allowEmpty?: boolean;
  initialIngredients?: Ingredient[]; // optional cache to avoid refetch
  compact?: boolean;
}

export function IngredientSelector({ value, onChange, allowEmpty, initialIngredients }: IngredientSelectorProps) {
  const [available, setAvailable] = useState<Ingredient[]>(initialIngredients || []);
  const [filters, setFilters] = useState<Array<{ query: string; macro: string; healthyOnly: boolean }>>([]);

  // Ensure filters length matches lines
  useEffect(() => {
    setFilters(prev => {
      const diff = value.length - prev.length;
      if (diff > 0) return [...prev, ...Array.from({ length: diff }, () => ({ query: '', macro: '', healthyOnly: false }))];
      if (diff < 0) return prev.slice(0, value.length);
      return prev;
    });
  }, [value.length]);

  useEffect(() => {
    if (initialIngredients?.length) return; // already have
    (async () => {
      try {
        const list = await ingredientApi.getAllIngredients();
        setAvailable(list);
      } catch (e) {
        console.error('Failed loading ingredients', e);
        toast.error('Failed to load ingredients');
      }
    })();
  }, [initialIngredients]);

  const setLineType = (index: number, type: 'existing' | 'new') => {
    onChange(value.map((line, i) => i === index ? (
      type === 'existing'
        ? { type: 'existing', existingId: '', displayOrder: line.displayOrder }
        : { type: 'new', displayOrder: line.displayOrder, newIngredient: { name: '', rating: 5, isHealthyOption: false, cost: 1, macro: '' } }
    ) : line));
  };

  const updateExisting = (index: number, ingredientId: string) => {
    const duplicate = value.some((l, i) => i !== index && l.type === 'existing' && l.existingId === ingredientId);
    if (duplicate) {
      toast.error('Ingredient already selected');
      return;
    }
    onChange(value.map((line, i) => i === index ? { ...line, existingId: ingredientId } : line));
  };

  const updateNewField = (index: number, field: string, v: string | number | boolean) => {
    onChange(value.map((line, i) => i === index && line.type === 'new' && line.newIngredient
      ? { ...line, newIngredient: { ...line.newIngredient, [field]: v } }
      : line));
  };

  const addLine = () => {
    const nextDisplayOrder = value.reduce((m, l) => Math.max(m, l.displayOrder), 0) + 1;
    onChange([{ type: 'existing', existingId: '', displayOrder: nextDisplayOrder }, ...value]);
    setFilters(prev => [{ query: '', macro: '', healthyOnly: false }, ...prev]);
  };

  const removeLine = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    if (!allowEmpty && updated.length === 0) {
      toast.error('At least one ingredient required');
      return;
    }
    onChange(updated);
  };

  const updateFilter = (index: number, patch: Partial<{ query: string; macro: string; healthyOnly: boolean }>) => {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f));
  };

  // Expose helper by returning function (pattern for parent) - parent can call via ref pattern if needed
  // Instead we just return created promise when needed externally.

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
        <button
          type="button"
          onClick={addLine}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">No ingredients yet.</div>
      )}

      {value.map((line, index) => {
        const filter = filters[index] || { query: '', macro: '', healthyOnly: false };
        return (
          <div key={line.displayOrder} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-medium text-gray-700">Ingredient {line.displayOrder}</h4>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLineType(index, 'existing')}
                    aria-pressed={line.type === 'existing'}
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${line.type === 'existing' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineType(index, 'new')}
                    aria-pressed={line.type === 'new'}
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${line.type === 'new' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
                  >
                    Create New
                  </button>
                </div>
              </div>
              {value.length > (allowEmpty ? 0 : 1) && (
                <button type="button" onClick={() => removeLine(index)} className="text-red-600 hover:text-red-800 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {line.type === 'existing' ? (
              available.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">No ingredients available. Create one instead.</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={filter.query}
                        onChange={(e) => updateFilter(index, { query: e.target.value })}
                        className="w-full pl-3 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <MacroSelect
                        value={filter.macro}
                        onChange={(v) => updateFilter(index, { macro: v })}
                        allowAll
                        exclude={['Dairy','Grain']}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        id={`healthy-filter-${index}`}
                        type="checkbox"
                        checked={filter.healthyOnly}
                        onChange={(e) => updateFilter(index, { healthyOnly: e.target.checked })}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor={`healthy-filter-${index}`} className="text-xs text-gray-600">Healthy</label>
                    </div>
                  </div>
                  {(() => {
                    let filtered = available;
                    if (filter.query) {
                      const q = filter.query.toLowerCase();
                      filtered = filtered.filter(ing => ing.name.toLowerCase().includes(q));
                    }
                    if (filter.macro) filtered = filtered.filter(ing => ing.macro === filter.macro);
                    if (filter.healthyOnly) filtered = filtered.filter(ing => ing.isHealthyOption);
                    return (
                      <select
                        value={line.existingId || ''}
                        onChange={(e) => updateExisting(index, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select an ingredient</option>
                        {filtered.map(ing => (
                          <option
                            key={ing.id}
                            value={ing.id}
                            disabled={line.existingId !== ing.id && value.some((l,i2)=> i2!==index && l.type==='existing' && l.existingId===ing.id)}
                          >
                            {ing.name} ({ing.macro}){ing.isHealthyOption ? ' • Healthy' : ''} - Rating: {ing.rating}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={line.newIngredient?.name || ''}
                      onChange={(e) => updateNewField(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      placeholder="e.g., Tomatoes"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Macro Type</label>
                    <MacroSelect
                      value={line.newIngredient?.macro || ''}
                      onChange={(v) => updateNewField(index, 'macro', v)}
                      exclude={['Dairy','Grain']}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Rating (1-10)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={line.newIngredient?.rating || 5}
                      onChange={(e) => updateNewField(index, 'rating', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Cost Rating</label>
                    <select
                      value={line.newIngredient?.cost || 1}
                      onChange={(e) => updateNewField(index, 'cost', parseInt(e.target.value))}
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
                      checked={line.newIngredient?.isHealthyOption || false}
                      onChange={(e) => updateNewField(index, 'isHealthyOption', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-900">Healthy ingredient</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper to be used by parents to convert selector state to Ingredient[] submitting new ones.
export async function processIngredientSelector(lines: IngredientLineState[], availableSnapshot: Ingredient[]): Promise<Ingredient[]> {
  const processed: Ingredient[] = [];
  for (const line of lines) {
    if (line.type === 'existing' && line.existingId) {
      const found = availableSnapshot.find(a => a.id === line.existingId);
      if (found) processed.push(found);
    } else if (line.type === 'new' && line.newIngredient) {
      const { name, rating, isHealthyOption, cost, macro } = line.newIngredient;
      if (name.trim() && macro) {
        const req: AddIngredientRequest = { name: name.trim(), rating, isHealthyOption, cost, macro };
        const created = await ingredientApi.addIngredient(req);
        processed.push(created);
        availableSnapshot.push(created);
      }
    }
  }
  return processed;
}

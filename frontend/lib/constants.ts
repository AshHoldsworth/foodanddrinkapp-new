// Centralized frontend constants to reduce duplication across forms & filters
// Update here to change available options globally.

export const macroOptions = [
  'Protein',
  'Carbohydrate',
  'Fat',
  'Vegetable',
  'Fruit',
  'Spice',
  'Dairy',
  'Grain',
] as const;

export const courseOptions = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
] as const;

export const costOptionsShort = [
  { value: 1, label: 'Cheap' },
  { value: 2, label: 'Moderate' },
  { value: 3, label: 'Expensive' },
] as const;

export const costOptionsNumbered = costOptionsShort.map(c => ({
  value: c.value,
  label: `${c.value} - ${c.label}`,
})) as readonly { value: number; label: string }[];

export const difficultyOptions = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
] as const;

export const speedOptions = [
  { value: 1, label: 'Quick' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Slow' },
] as const;

#!/usr/bin/env bash
# Inserts a base set of common ingredients directly into the local MongoDB instance.
# Requires: mongosh
#
# Usage: ./scrips/seed-ingredients.sh - uses default values
# Usage: ./scrips/seed-ingredients.sh [connection_string] [database_name] - optional parameters

set -euo pipefail

MONGO_URI="${1:-mongodb://localhost:27017}"
DATABASE="${2:-FoodAndDrinkApp}"

if ! command -v mongosh &>/dev/null; then
  echo "Error: mongosh is not installed. Install it from https://www.mongodb.com/docs/mongodb-shell/install/"
  exit 1
fi

echo "Seeding common ingredients into ${MONGO_URI}/${DATABASE}..."

mongosh "${MONGO_URI}/${DATABASE}" --quiet <<'EOF'
const now = new Date();

const ingredients = [
  { Name: 'Chicken Breast', Rating: 8, IsHealthyOption: true, Cost: 2, Macro: 'Protein' },
  { Name: 'Chicken Mini Fillets', Rating: 9, IsHealthyOption: true, Cost: 2, Macro: 'Protein' },
  { Name: 'Chicken Thighs', Rating: 7, IsHealthyOption: true, Cost: 3, Macro: 'Protein' },
  { Name: 'Eggs', Rating: 7, IsHealthyOption: true, Cost: 1, Macro: 'Protein' },
  { Name: 'Beef Mince', Rating: 7, IsHealthyOption: true, Cost: 2, Macro: 'Protein' },
  { Name: 'Greek Yogurt', Rating: 8, IsHealthyOption: true, Cost: 2, Macro: 'Protein' },

  { Name: 'Rice', Rating: 9, IsHealthyOption: true, Cost: 1, Macro: 'Carbs' },
  { Name: 'Brown Rice', Rating: 8, IsHealthyOption: true, Cost: 1, Macro: 'Carbs' },
  { Name: 'Pasta', Rating: 8, IsHealthyOption: false, Cost: 1, Macro: 'Carbs' },
  { Name: 'Sweet Potato', Rating: 9, IsHealthyOption: true, Cost: 1, Macro: 'Carbs' },
  { Name: 'Oats', Rating: 9, IsHealthyOption: true, Cost: 1, Macro: 'Carbs' },
  { Name: 'Bread', Rating: 7, IsHealthyOption: false, Cost: 1, Macro: 'Carbs' },

  { Name: 'Olive Oil', Rating: 9, IsHealthyOption: true, Cost: 2, Macro: 'Fat' },
  { Name: 'Vegetable Oil', Rating: 7, IsHealthyOption: true, Cost: 1, Macro: 'Fat' },
  { Name: 'Avocado', Rating: 8, IsHealthyOption: true, Cost: 2, Macro: 'Fat' },
  { Name: 'Peanut Butter', Rating: 8, IsHealthyOption: true, Cost: 2, Macro: 'Fat' },
  { Name: 'Butter', Rating: 6, IsHealthyOption: false, Cost: 1, Macro: 'Fat' },
  { Name: 'Mayonnaise', Rating: 8, IsHealthyOption: false, Cost: 1, Macro: 'Fat' },
  { Name: 'Cream', Rating: 7, IsHealthyOption: false, Cost: 1, Macro: 'Fat' },
  { Name: 'Coconut Oil', Rating: 7, IsHealthyOption: true, Cost: 2, Macro: 'Fat' },
  { Name: 'Creme Fraiche', Rating: 8, IsHealthyOption: true, Cost: 2, Macro: 'Fat' },

  { Name: 'Broccoli', Rating: 9, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Spinach', Rating: 8, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Bell Pepper', Rating: 8, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Tomatoes', Rating: 8, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'White Onion', Rating: 6, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Red Onion', Rating: 8, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Garlic', Rating: 8, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Mushrooms', Rating: 1, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Carrots', Rating: 6, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
  { Name: 'Lettuce', Rating: 7, IsHealthyOption: true, Cost: 1, Macro: 'Vegetable' },
].map((ingredient) => ({
  ...ingredient,
  CreatedAt: now,
  UpdatedAt: null,
}));

const existingNames = new Set(
  db.ingredients
    .find({}, { Name: 1, _id: 0 })
    .toArray()
    .map((ingredient) => ingredient.Name.toLowerCase())
);

const documentsToInsert = ingredients
  .filter((ingredient) => !existingNames.has(ingredient.Name.toLowerCase()))
  .map((ingredient) => ({
    _id: new ObjectId(),
    Name: ingredient.Name,
    Rating: ingredient.Rating,
    IsHealthyOption: ingredient.IsHealthyOption,
    Cost: ingredient.Cost,
    Macro: ingredient.Macro,
    Barcodes: null,
    CreatedAt: ingredient.CreatedAt,
    UpdatedAt: ingredient.UpdatedAt,
  }));

if (documentsToInsert.length === 0) {
  print('All common ingredients already exist. Nothing to insert.');
  quit(0);
}

db.ingredients.insertMany(documentsToInsert);

print(`Inserted ${documentsToInsert.length} ingredients.`);
print(`Skipped ${ingredients.length - documentsToInsert.length} ingredients that already existed.`);
EOF

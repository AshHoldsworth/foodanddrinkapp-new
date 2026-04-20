#!/usr/bin/env bash
# Creates MongoDB indexes for all collections used by the API.
# Safe to run multiple times — createIndex() is idempotent.
# Requires: mongosh
#
# Collection names default to the values used by the API.
# Override via environment variables if your config differs, e.g.:
#   MEAL_COLLECTION=meals ./scripts/seed-indexes.sh
#
# Usage: ./scripts/seed-indexes.sh
# Usage: ./scripts/seed-indexes.sh [connection_string] [database_name]

set -euo pipefail

MONGO_URI="${1:-mongodb://localhost:27017}"
DATABASE="${2:-FoodAndDrinkApp}"

# Match these to your MongoDB config values (docker-compose / appsettings)
MEAL_COLLECTION="${MEAL_COLLECTION:-foods}"
DRINK_COLLECTION="${DRINK_COLLECTION:-drinks}"
INGREDIENT_COLLECTION="${INGREDIENT_COLLECTION:-ingredients}"
INVENTORY_COLLECTION="${INVENTORY_COLLECTION:-inventory}"
USER_COLLECTION="${USER_COLLECTION:-users}"
USER_GROUP_COLLECTION="${USER_GROUP_COLLECTION:-userGroups}"
MEAL_PLAN_COLLECTION="${MEAL_PLAN_COLLECTION:-mealPlans}"
SHOPPING_LIST_COLLECTION="${SHOPPING_LIST_COLLECTION:-shoppingLists}"

if ! command -v mongosh &>/dev/null; then
  echo "Error: mongosh is not installed. Install it from https://www.mongodb.com/docs/mongodb-shell/install/"
  exit 1
fi

echo "Creating indexes in ${MONGO_URI}/${DATABASE}..."

mongosh "${MONGO_URI}/${DATABASE}" --quiet --eval "
const mealCollection         = '${MEAL_COLLECTION}';
const drinkCollection        = '${DRINK_COLLECTION}';
const ingredientCollection   = '${INGREDIENT_COLLECTION}';
const inventoryCollection    = '${INVENTORY_COLLECTION}';
const userCollection         = '${USER_COLLECTION}';
const userGroupCollection    = '${USER_GROUP_COLLECTION}';
const mealPlanCollection     = '${MEAL_PLAN_COLLECTION}';
const shoppingListCollection = '${SHOPPING_LIST_COLLECTION}';

// ── users ────────────────────────────────────────────────────────────────────
// GetByUsername: Filter.Eq(user => user.Username, username)
db[userCollection].createIndex(
  { Username: 1 },
  { unique: true, name: 'username_unique' }
);

// ── userGroups ────────────────────────────────────────────────────────────────
// GetByName: Filter.Eq(item => item.Name, name)
db[userGroupCollection].createIndex(
  { Name: 1 },
  { unique: true, name: 'name_unique' }
);

// ── mealPlans ─────────────────────────────────────────────────────────────────
// GetByWeekStart / UpsertMealPlan: compound eq on GroupId + WeekStart
db[mealPlanCollection].createIndex(
  { GroupId: 1, WeekStart: 1 },
  { unique: true, name: 'group_weekstart_unique' }
);

// ── shoppingLists ─────────────────────────────────────────────────────────────
// GetActive:    Filter(GroupId, IsCompleted=false) + SortByDescending(CreatedAt)
// GetCompleted: Filter(GroupId, IsCompleted=true)  + SortByDescending(CompletedAt)
// GetById:      Filter(GroupId, Id)
db[shoppingListCollection].createIndex(
  { GroupId: 1, IsCompleted: 1, CreatedAt: -1 },
  { name: 'group_completed_created' }
);
db[shoppingListCollection].createIndex(
  { GroupId: 1, IsCompleted: 1, CompletedAt: -1 },
  { name: 'group_completed_completedat' }
);

// ── inventory ─────────────────────────────────────────────────────────────────
// GetByGroupId: Filter.Eq(item => item.GroupId, groupId)
// One document per group — enforce uniqueness.
db[inventoryCollection].createIndex(
  { GroupId: 1 },
  { unique: true, name: 'group_unique' }
);

// ── ingredients ───────────────────────────────────────────────────────────────
// GetAllIngredients: Regex search on Name and Barcodes
// GetIngredientsListByIds: Filter.In(i => i.Id, ids)  — covered by _id
// Barcodes: multikey array index, sparse because most docs have no barcodes
db[ingredientCollection].createIndex(
  { Name: 1 },
  { name: 'name' }
);
db[ingredientCollection].createIndex(
  { Barcodes: 1 },
  { sparse: true, name: 'barcodes' }
);
// Also index the legacy lowercase field written by older clients
db[ingredientCollection].createIndex(
  { barcodes: 1 },
  { sparse: true, name: 'barcodes_legacy' }
);

// ── meals (foods) ─────────────────────────────────────────────────────────────
// GetAllMeal: Regex search on Name; eq/range on IsHealthyOption, Cost, Rating, Speed
// GetMealsByIds: Filter.In(meal => meal.Id, ids)  — covered by _id
db[mealCollection].createIndex(
  { Name: 1 },
  { name: 'name' }
);

// ── drinks ────────────────────────────────────────────────────────────────────
// GetAllDrinks: Regex search on Name; eq/range on IsHealthyOption, Cost, Rating, Speed
db[drinkCollection].createIndex(
  { Name: 1 },
  { name: 'name' }
);

print('Done. All indexes created successfully.');
"

# Scripts

Helper scripts for bootstrapping local MongoDB data and indexes.

## Prerequisites

- `mongosh` installed and available on `PATH`
- A reachable MongoDB instance

All scripts exit on error and are intended for local or development use.

## Files

### `seed-admin.sh`

Creates an admin user directly in MongoDB using the same PBKDF2-SHA256 hashing approach as the API.

Usage:

```bash
./scripts/seed-admin.sh
./scripts/seed-admin.sh <username> <password> <connection_string> <database_name>
```

Defaults:

- Username: `admin`
- Password: `changeme`
- Connection string: `mongodb://localhost:27017`
- Database: `FoodAndDrinkApp`

Example for Docker Compose MongoDB:

```bash
./scripts/seed-admin.sh admin changeme mongodb://localhost:27018 FoodAndDrinkDb
```

### `seed-indexes.sh`

Creates the indexes used by the API repositories. The script is safe to run multiple times.

Usage:

```bash
./scripts/seed-indexes.sh
./scripts/seed-indexes.sh <connection_string> <database_name>
```

Defaults:

- Connection string: `mongodb://localhost:27017`
- Database: `FoodAndDrinkApp`

Collection names can be overridden with environment variables:

- `MEAL_COLLECTION`
- `DRINK_COLLECTION`
- `INGREDIENT_COLLECTION`
- `INVENTORY_COLLECTION`
- `USER_COLLECTION`
- `USER_GROUP_COLLECTION`
- `MEAL_PLAN_COLLECTION`
- `SHOPPING_LIST_COLLECTION`

Current defaults inside the script include `foods` as the meal collection name.

Example for Docker Compose MongoDB:

```bash
./scripts/seed-indexes.sh mongodb://localhost:27018 FoodAndDrinkDb
```

### `seed-ingredients.sh`

Seeds a base list of common ingredients and skips entries that already exist by name.

Usage:

```bash
./scripts/seed-ingredients.sh
./scripts/seed-ingredients.sh <connection_string> <database_name>
```

Defaults:

- Connection string: `mongodb://localhost:27017`
- Database: `FoodAndDrinkApp`

Example for Docker Compose MongoDB:

```bash
./scripts/seed-ingredients.sh mongodb://localhost:27018 FoodAndDrinkDb
```

## Typical Local Setup

If you are using Docker Compose from the repository root, a common sequence is:

```bash
docker compose up -d mongo
./scripts/seed-indexes.sh mongodb://localhost:27018 FoodAndDrinkDb
./scripts/seed-ingredients.sh mongodb://localhost:27018 FoodAndDrinkDb
./scripts/seed-admin.sh admin changeme mongodb://localhost:27018 FoodAndDrinkDb
```

## Notes

- Script defaults do not exactly match the Docker Compose MongoDB port and database name, so pass explicit arguments when using the compose stack
- `seed-admin.sh` aborts if the username already exists
- `seed-ingredients.sh` only inserts ingredients that are not already present

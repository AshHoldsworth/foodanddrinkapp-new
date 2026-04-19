#!/usr/bin/env bash
# Inserts a default admin user directly into the local MongoDB instance.
# Replicates the same PBKDF2-SHA256 hashing used by the API.
# Requires: mongosh
#
# Usage: .scripts/seed-admin.sh - uses default values
# Usage: .scripts/seed-admin.sh [username] [password] [connection_string] [database_name] - optional parameters

set -euo pipefail

USERNAME="${1:-admin}"
PASSWORD="${2:-changeme}"
MONGO_URI="${3:-mongodb://localhost:27017}"
DATABASE="${4:-FoodAndDrinkApp}"

if ! command -v mongosh &>/dev/null; then
  echo "Error: mongosh is not installed. Install it from https://www.mongodb.com/docs/mongodb-shell/install/"
  exit 1
fi

echo "Seeding admin user '${USERNAME}' into ${MONGO_URI}/${DATABASE}..."

mongosh "${MONGO_URI}/${DATABASE}" --quiet --eval "
const username = '${USERNAME}'.trim().toLowerCase();
const password = '${PASSWORD}';

const existing = db.users.findOne({ Username: username });
if (existing) {
  print('User \\'' + username + '\\' already exists. Aborting.');
  quit(1);
}

// Replicate PBKDF2-SHA256 (100k iterations, 16-byte salt, 32-byte hash) — same as AuthService
const crypto = require('crypto');
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

db.users.insertOne({
  _id: new ObjectId(),
  Username: username,
  Role: 'admin',
  PasswordHash: hash.toString('base64'),
  PasswordSalt: salt.toString('base64'),
  CreatedAt: new Date(),
});

print('Admin user \\'' + username + '\\' created successfully.');
"

#!/usr/bin/env bash

set -eou pipefail

# Check DATABASE_URL is set
if [ -z ${DATABASE_URL+x} ]; then
  echo "DATABASE_URL is unset"
  exit 1
fi

# Check if yarn executable is available
if ! command -v yarn &>/dev/null; then
  echo "Prisma CLI could not be found"
  exit 1
fi

# Check if prisma schema file exists
if [ ! -f ./prisma/schema.prisma ]; then
  echo "Prisma schema file not found"
  exit 1
fi

# Check if prisma migration directory exists
if [ ! -d ./prisma/migrations ]; then
  echo "Prisma migrations directory not found"
  exit 1
fi

function migrate() {
  echo "Attempting to migrate database"
  yarn dlx prisma migrate deploy
}

# Attempt to migrate database (retry 5 times with 5 second delay)
function attempt_migration() {
  for i in {1..5}; do
    if migrate; then
      echo "Migration successful (attempt $i/5)"
      break
    else
      echo "Migration failed (attempt $i/5), retrying in 5 seconds..."
      sleep 5
    fi
  done
  if [ $i -eq 5 ]; then
    echo "Migration failed after 5 attempts"
    exit 1
  fi
}

attempt_migration

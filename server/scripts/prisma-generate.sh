#!/usr/bin/env bash

# Download Prisma Engine + Node
prisma py fetch

# Generate Prisma Client for Python
prisma generate

# Remove node binaries
rm -rvf \
  /root/.cache/prisma-python/nodeenv/ \
  /app/node_modules/ \
  /app/website/node_modules/


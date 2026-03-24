#!/bin/bash

# 0. Clean up previous build artifacts to prevent "ghost" code
echo "Cleaning old build files..."
rm -rf .open-next .next

# 1. Load local environment variables from .dev.vars for the build process
if [ -f .dev.vars ]; then
  echo "Injecting variables from .dev.vars..."
  # This exports variables so 'next build' can bake NEXT_PUBLIC_ ones into the JS
  export $(grep -v '^#' .dev.vars | xargs)
fi

# 2. Build (Now with a clean slate and injected variables)
echo "Starting OpenNext Cloudflare build..."
npx @opennextjs/cloudflare build

# 3. Patch the file in place (Required for OpenNext/Cloudflare compatibility)
echo "Patching worker.js..."
sed -i '/cloudflare:images/d' .open-next/worker.js
sed -i '/cloudflare:init/d' .open-next/worker.js
sed -i '/export.*durable-objects/d' .open-next/worker.js

# 4. Deploy using the local .open-next folder
echo "Deploying to Cloudflare..."
CLOUDFLARE_ACCOUNT_ID="cb3044204295ef3684c735ceef8cfc40" \
npx wrangler deploy .open-next/worker.js \
  --config ./wrangler.toml \
  --no-experimental-autoconfig \
  --assets .open-next/assets
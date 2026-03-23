#!/bin/bash
# 1. Build
npx @opennextjs/cloudflare build

# 2. Patch the file in place (where OpenNext puts it)
sed -i '/cloudflare:images/d' .open-next/worker.js
sed -i '/cloudflare:init/d' .open-next/worker.js
sed -i '/export.*durable-objects/d' .open-next/worker.js

# 3. Deploy using the local .open-next folder
CLOUDFLARE_ACCOUNT_ID="cb3044204295ef3684c735ceef8cfc40" \
npx wrangler deploy .open-next/worker.js \
  --config ./wrangler.toml \
  --no-experimental-autoconfig \
  --assets .open-next/assets
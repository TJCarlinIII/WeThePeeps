#!/bin/bash
# 1. Build the Next.js app with OpenNext
npx @opennextjs/cloudflare build

# 2. Sync to the deploy folder
rm -rf ~/peeps-deploy/*
cp -RT .open-next/ ~/peeps-deploy/
mv ~/peeps-deploy/worker.js ~/peeps-deploy/index.js

# 3. Apply the "Free Tier" patches
pushd ~/peeps-deploy
sed -i '/cloudflare:images/d' index.js
sed -i '/cloudflare:init/d' index.js
sed -i '/export.*durable-objects/d' index.js
popd

# 4. Force a standard Wrangler deploy
# We use --config to point to our file and skip framework detection
CLOUDFLARE_ACCOUNT_ID="cb3044204295ef3684c735ceef8cfc40" npx wrangler deploy --config ./wrangler.toml --no-experimental-autoconfig

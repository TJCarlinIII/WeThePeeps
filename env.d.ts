interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
}

// Don't try to merge it into NodeJS.ProcessEnv manually here; 
// let the @cloudflare/workers-types handle the global scope.
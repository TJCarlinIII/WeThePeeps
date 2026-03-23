interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  // Add R2 if you are using it for Evidence Locker files
  // EVIDENCE_BUCKET: R2Bucket; 
}

declare global {
  namespace NodeJS {
    // Using a type alias instead of an empty interface to satisfy ESLint
    type ProcessEnv = CloudflareEnv;
  }
}

export {};
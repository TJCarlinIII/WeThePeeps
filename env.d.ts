interface CloudflareEnv {
  DB: D1Database;
  ASSETS: Fetcher;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {}
  }
}

export {};
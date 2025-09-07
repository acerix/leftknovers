interface Env {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
  RESEND_API_KEY: string;
}

declare global {
  interface CloudflareEnv extends Env {}
}

export type { Env };

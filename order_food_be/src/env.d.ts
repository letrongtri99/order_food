declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    TOKEN_SECRET: string;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
  }
}
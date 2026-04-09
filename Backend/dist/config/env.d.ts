export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    CLIENT_URL: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
    PIN_RATE_LIMIT_MAX: number;
    VOTE_RATE_LIMIT_MAX: number;
};
export type Env = typeof env;
//# sourceMappingURL=env.d.ts.map
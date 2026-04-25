// server/src/config/env.ts
// Validated environment variables — import from here ONLY, never process.env directly.

import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test']),
  PORT:                 z.coerce.number().default(5000),
  CLIENT_URL:           z.string().url(),
  DATABASE_URL:         z.string().min(1),
  REDIS_URL:            z.string().min(1),
  JWT_SECRET:           z.string().min(32),
  JWT_EXPIRES_IN:       z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX:       z.coerce.number().default(100),
  PIN_RATE_LIMIT_MAX:   z.coerce.number().default(10),
  VOTE_RATE_LIMIT_MAX:  z.coerce.number().default(30),
  MATCH_RADIUS_METERS:  z.coerce.number().default(2000),
  CIRCLE_AUTO_THRESHOLD:z.coerce.number().default(10),
  EVENT_CLUSTER_THRESHOLD: z.coerce.number().default(5),
  VAPID_EMAIL:          z.string().default('mailto:admin@moodmap.app'),
  VAPID_PUBLIC_KEY:     z.string().default(''),
  VAPID_PRIVATE_KEY:    z.string().default(''),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

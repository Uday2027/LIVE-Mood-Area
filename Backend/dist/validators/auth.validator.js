// server/src/validators/auth.validator.ts
// Zod schemas for auth-related request validation.
import { z } from 'zod';
export const registerSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, {
            message: 'Username may only contain letters, numbers, and underscores',
        }),
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1, 'Password is required'),
    }),
});
//# sourceMappingURL=auth.validator.js.map
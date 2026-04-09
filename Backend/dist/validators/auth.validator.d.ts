import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        password: string;
        email: string;
    }, {
        username: string;
        password: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        username: string;
        password: string;
        email: string;
    };
}, {
    body: {
        username: string;
        password: string;
        email: string;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
    }, {
        password: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
    };
}, {
    body: {
        password: string;
        email: string;
    };
}>;
export type RegisterBody = z.infer<typeof registerSchema>['body'];
export type LoginBody = z.infer<typeof loginSchema>['body'];
//# sourceMappingURL=auth.validator.d.ts.map
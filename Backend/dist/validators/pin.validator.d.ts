import { z } from 'zod';
export declare const createPinSchema: z.ZodObject<{
    body: z.ZodObject<{
        mood: z.ZodEnum<["CHILL", "HYPE", "FOCUSED", "ROMANTIC", "SKETCHY"]>;
        message: z.ZodOptional<z.ZodString>;
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        mood: "CHILL" | "HYPE" | "FOCUSED" | "ROMANTIC" | "SKETCHY";
        latitude: number;
        longitude: number;
        message?: string | undefined;
    }, {
        mood: "CHILL" | "HYPE" | "FOCUSED" | "ROMANTIC" | "SKETCHY";
        latitude: number;
        longitude: number;
        message?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        mood: "CHILL" | "HYPE" | "FOCUSED" | "ROMANTIC" | "SKETCHY";
        latitude: number;
        longitude: number;
        message?: string | undefined;
    };
}, {
    body: {
        mood: "CHILL" | "HYPE" | "FOCUSED" | "ROMANTIC" | "SKETCHY";
        latitude: number;
        longitude: number;
        message?: string | undefined;
    };
}>;
export declare const voteSchema: z.ZodObject<{
    body: z.ZodObject<{
        vote: z.ZodEnum<["CONFIRM", "DISPUTE"]>;
    }, "strip", z.ZodTypeAny, {
        vote: "CONFIRM" | "DISPUTE";
    }, {
        vote: "CONFIRM" | "DISPUTE";
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        vote: "CONFIRM" | "DISPUTE";
    };
}, {
    params: {
        id: string;
    };
    body: {
        vote: "CONFIRM" | "DISPUTE";
    };
}>;
export declare const pinIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export type CreatePinBody = z.infer<typeof createPinSchema>['body'];
export type VoteBody = z.infer<typeof voteSchema>['body'];
//# sourceMappingURL=pin.validator.d.ts.map
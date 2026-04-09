import type { RegisterBody, LoginBody } from '../validators/auth.validator.js';
export declare const register: (data: RegisterBody) => Promise<{
    token: string;
    user: unknown;
}>;
export declare const login: (data: LoginBody) => Promise<{
    token: string;
    user: unknown;
}>;
export declare const getProfile: (userId: string) => Promise<unknown>;
//# sourceMappingURL=auth.service.d.ts.map
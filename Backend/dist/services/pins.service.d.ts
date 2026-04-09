import type { Server } from 'socket.io';
import type { CreatePinBody } from '../validators/pin.validator.js';
export declare const getActivePins: () => Promise<unknown[]>;
type CreatePinInput = CreatePinBody & {
    sessionId: string;
    userId: string | null;
};
export declare const createPin: (data: CreatePinInput, io: Server) => Promise<unknown>;
export declare const getPinVotes: (pinId: string) => Promise<unknown>;
export declare const deletePin: (pinId: string, sessionId: string | null, userId: string | undefined) => Promise<void>;
export {};
//# sourceMappingURL=pins.service.d.ts.map
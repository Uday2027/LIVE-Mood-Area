// server/src/types/express.d.ts
// Extends the Express Request type with project-specific properties injected by middleware.

import type { JwtPayload } from 'jsonwebtoken';

export interface AuthUser extends JwtPayload {
  id: string;
  email: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      /** Injected by sessionMiddleware from the x-session-id header. */
      sessionId: string | null;
      /** Injected by requireAuth / optionalAuth middleware. */
      user?: AuthUser;
    }
  }
}

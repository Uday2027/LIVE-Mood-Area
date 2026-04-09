// server/src/routes/auth.ts
// Auth routes — register, login, profile, and user pin history.
import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import * as AuthController from '../controllers/auth.controller.js';
const router = Router();
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);
export default router;
//# sourceMappingURL=auth.js.map
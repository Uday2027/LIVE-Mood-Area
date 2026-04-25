import { Router } from 'express';
import * as EventsController from '../controllers/events.controller.js';

const router = Router();
router.get('/nearby', EventsController.getNearbyEvents);
export default router;

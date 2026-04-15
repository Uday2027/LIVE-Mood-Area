// server/src/routes/stories.ts
import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getStoriesSchema, createStorySchema, storyIdParamSchema } from '../validators/story.validator.js';
import * as StoriesController from '../controllers/stories.controller.js';

const router = Router();

router.get('/', validate(getStoriesSchema), StoriesController.getNeighborhoodStories);
router.post('/', requireAuth, validate(createStorySchema), StoriesController.createStory);
router.delete('/:id', requireAuth, validate(storyIdParamSchema), StoriesController.deleteStory);

export default router;

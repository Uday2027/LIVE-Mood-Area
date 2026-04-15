// server/src/controllers/stories.controller.ts
import * as StoryService from '../services/stories.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
import { Mood } from '@prisma/client';

export const getNeighborhoodStories = catchAsync(async (req, res) => {
  const neighborhoodId = req.query.neighborhoodId as string;
  const stories = await StoryService.getNeighborhoodStories(neighborhoodId, req.sessionId!);
  success(res, stories);
});

export const createStory = catchAsync(async (req, res) => {
  const { neighborhoodId, mood, content, imageUrl } = req.body;
  const story = await StoryService.createStory({
    userId: req.user!.id,
    neighborhoodId,
    mood: mood as Mood,
    content,
    imageUrl,
  });
  created(res, story);
});

export const deleteStory = catchAsync(async (req, res) => {
  await StoryService.deleteStory(req.params.id as string, req.user!.id);
  success(res, { message: 'Story deleted successfully' });
});

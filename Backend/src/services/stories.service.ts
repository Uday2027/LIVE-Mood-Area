// server/src/services/stories.service.ts
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { Mood } from '@prisma/client';

export const getNeighborhoodStories = async (neighborhoodId: string, sessionId: string) => {
  const stories = await prisma.moodStory.findMany({
    where: {
      neighborhoodId,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { select: { username: true, avatarUrl: true } },
      views: {
        where: { viewerSession: sessionId },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const processedStories = await Promise.all(
    stories.map(async (st) => {
      const hasViewed = st.views.length > 0;

      if (!hasViewed) {
        try {
          await prisma.storyView.create({
            data: { storyId: st.id, viewerSession: sessionId },
          });
          // Also increment viewCount
          await prisma.moodStory.update({
            where: { id: st.id },
            data: { viewCount: { increment: 1 } },
          });
          st.viewCount += 1;
        } catch (e) {
          // ignore duplicate view error (P2002)
        }
      }

      const { views, ...rest } = st;
      return { ...rest, hasViewed: true }; // since they just viewed it
    })
  );

  return processedStories;
};

export const createStory = async (data: {
  userId: string;
  neighborhoodId: string;
  mood: Mood;
  content?: string;
  imageUrl?: string;
}) => {
  const activeCount = await prisma.moodStory.count({
    where: {
      userId: data.userId,
      expiresAt: { gt: new Date() },
    },
  });

  if (activeCount >= 3) {
    throw new AppError('Maximum active stories reached', 429);
  }

  const neighborhood = await prisma.neighborhood.findUnique({ where: { id: data.neighborhoodId }});
  if (!neighborhood) throw new AppError('Neighborhood not found', 404);

  return prisma.moodStory.create({
    data: {
      ...data,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
};

export const deleteStory = async (storyId: string, userId: string) => {
  const story = await prisma.moodStory.findUnique({ where: { id: storyId } });
  if (!story) throw new AppError('Story not found', 404);
  if (story.userId !== userId) throw new AppError('Unauthorized', 403);

  await prisma.moodStory.delete({ where: { id: storyId } });
};

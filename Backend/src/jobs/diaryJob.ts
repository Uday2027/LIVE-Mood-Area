import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { sendPushNotification } from '../services/push.service.js';

export const generateWeeklyDiaries = async () => {
  logger.info('[DiaryJob] Starting weekly diary generation');
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  try {
    const usersWithActivity = await prisma.user.findMany({
      where: {
        pins: {
          some: {
            createdAt: { gte: weekStart }
          }
        }
      },
      include: {
        pins: {
          where: { createdAt: { gte: weekStart } },
          include: { neighborhood: true }
        }
      }
    });

    for (const user of usersWithActivity) {
      if (user.pins.length === 0) continue;

      const moodCounts: Record<string, number> = {};
      const neighborhoods = new Set<string>();

      // Track best pin by vote count using index
      let highlightIdx = 0;

      user.pins.forEach((pin, idx) => {
        moodCounts[pin.mood] = (moodCounts[pin.mood] ?? 0) + 1;
        if (pin.neighborhood) neighborhoods.add(pin.neighborhood.name);

        const currentBest = user.pins[highlightIdx];
        if (currentBest && pin.credibilityScore > currentBest.credibilityScore) {
          highlightIdx = idx;
        }
      });

      const firstPin = user.pins[0]!;
      const dominantMood = Object.keys(moodCounts).reduce(
        (a, b) => (moodCounts[a] ?? 0) > (moodCounts[b] ?? 0) ? a : b,
        firstPin.mood
      );

      const highlightPin = user.pins[highlightIdx];
      const highlight = highlightPin?.message
        ? `Most verified: "${highlightPin.message}"`
        : `You dropped a ${highlightPin?.mood ?? dominantMood} pin this week!`;

      const summaryData = {
        dominantMood,
        totalPins: user.pins.length,
        neighborhoodsVisited: neighborhoods.size,
        highlight,
        moodCounts
      };

      await prisma.moodDiary.create({
        data: {
          userId: user.id,
          weekStart,
          weekEnd: now,
          summaryData
        }
      });

      await sendPushNotification(user.id, {
        title: 'Your Weekly Vibe Diary is Ready! 📖',
        body: `You were mostly ${dominantMood} this week. Check out your full summary.`,
        data: '/profile'
      });
    }

    logger.info(`[DiaryJob] Generated diaries for ${usersWithActivity.length} users`);
  } catch (error) {
    logger.error('[DiaryJob] Failed to generate diaries:', error);
  }
};

let intervalId: NodeJS.Timeout;

export const startDiaryJob = () => {
  intervalId = setInterval(() => {
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() === 9) {
      generateWeeklyDiaries();
    }
  }, 60 * 60 * 1000);
  logger.info('Diary cron job initialized (runs Sunday 9am)');
};

export const stopDiaryJob = () => {
  if (intervalId) clearInterval(intervalId);
};

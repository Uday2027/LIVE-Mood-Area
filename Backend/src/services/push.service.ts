import { prisma } from '../config/database.js';
import webpush from 'web-push';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(env.VAPID_EMAIL, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

export const subscribe = async (sessionId: string, userId: string | undefined, subscription: any) => {
  const sub = await prisma.pushSubscription.create({
    data: {
      sessionId,
      ...(userId !== undefined ? { userId } : {}),
      subscription
    }
  });
  return sub;
};

export const sendPushNotification = async (sessionId: string, payload: any) => {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    logger.warn('Push notifications disabled — VAPID keys not configured');
    return;
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { sessionId }
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription as any, JSON.stringify(payload));
    } catch (err: any) {
      if (err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        logger.error(`Push notification failed: ${err.message}`);
      }
    }
  }
};

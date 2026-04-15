// server/src/services/push.service.ts
// Web Push logic — handles subscriptions and sending notifications.

import webpush from 'web-push';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Setup VAPID keys from env
webpush.setVapidDetails(
  env.VAPID_EMAIL,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export type PushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

/**
 * Save or update a session's push subscription.
 */
export const subscribe = async (
  sessionId: string,
  subscription: PushSubscription,
  userId?: string
): Promise<void> => {
  await prisma.pushSubscription.upsert({
    where: { sessionId },
    update: {
      endpoint: subscription.endpoint,
      p256dh:   subscription.keys.p256dh,
      auth:     subscription.keys.auth,
      userId:   userId ?? null,
    },
    create: {
      sessionId,
      endpoint: subscription.endpoint,
      p256dh:   subscription.keys.p256dh,
      auth:     subscription.keys.auth,
      userId:   userId ?? null,
    },
  });
};

/**
 * Send a notification to a specific session.
 */
export const sendToSession = async (
  sessionId: string,
  payload: { title: string; body: string; data?: any }
): Promise<void> => {
  const sub = await prisma.pushSubscription.findUnique({
    where: { sessionId },
  });

  if (!sub) return;

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth:   sub.auth,
        },
      },
      JSON.stringify(payload)
    );
  } catch (err: any) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      // Subscription expired or gone, remove it
      logger.info(`Cleaning up expired subscription for session ${sessionId}`);
      await prisma.pushSubscription.delete({ where: { sessionId } }).catch(() => {});
    } else {
      logger.error('Failed to send push notification', { err, sessionId });
    }
  }
};

/**
 * Send a notification to all active sessions of a user.
 */
export const sendToUser = async (
  userId: string,
  payload: { title: string; body: string; data?: any }
): Promise<void> => {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.all(
    subs.map((s) => sendToSession(s.sessionId, payload))
  );
};

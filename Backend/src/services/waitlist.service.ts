import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const joinWaitlist = async (data: { email: string; city: string; referredBy?: string }) => {
  const existing = await prisma.waitlist.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Email already registered', 400);

  let referredByObj = null;
  if (data.referredBy) {
    referredByObj = await prisma.waitlist.findUnique({ where: { referralCode: data.referredBy } });
    if (!referredByObj) throw new AppError('Invalid referral code', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const count = await tx.waitlist.count();
    const position = count + 1;

    const entry = await tx.waitlist.create({
      data: {
        email: data.email,
        city: data.city,
        referralCode: generateReferralCode(),
        referredBy: data.referredBy || null,
        position
      }
    });

    if (referredByObj) {
      await tx.waitlist.update({
        where: { id: referredByObj.id },
        data: { referralCount: { increment: 1 } }
      });
    }

    return entry;
  });

  return result;
};

export const getWaitlistStats = async () => {
  const total = await prisma.waitlist.count();
  const byCity = await prisma.waitlist.groupBy({
    by: ['city'],
    _count: { city: true },
    orderBy: { _count: { city: 'desc' } },
    take: 10
  });

  return { total, byCity };
};

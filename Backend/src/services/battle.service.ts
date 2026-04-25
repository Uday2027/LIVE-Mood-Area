import { prisma } from '../config/database.js';

export const getCurrentBattle = async () => {
  const battle = await prisma.neighborhoodBattle.findFirst({
    where: { isActive: true },
    include: {
      scores: {
        orderBy: { recordedAt: 'desc' },
        take: 10 // Get latest scores
      }
    },
    orderBy: { startDate: 'desc' }
  });
  return battle;
};

export const getBattleHistory = async () => {
  const history = await prisma.neighborhoodBattle.findMany({
    where: { isActive: false },
    include: { winnerNeighborhood: true },
    orderBy: { endDate: 'desc' },
    take: 10
  });
  return history;
};

// src/services/__tests__/votes.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire Prisma singleton BEFORE importing the service under test
vi.mock('../../config/database.js', () => ({
  prisma: {
    pinVote: {
      groupBy: vi.fn(),
      create:  vi.fn(),
    },
    moodPin: {
      update:      vi.fn(),
      delete:      vi.fn(),
      findFirst:   vi.fn(),
    },
  },
}));

// Dynamic import AFTER the mock is registered
const { prisma }                 = await import('../../config/database.js');
const { recalculateCredibility } = await import('../votes.service.js');

const mockGroupBy = vi.mocked(prisma.pinVote.groupBy);
const mockUpdate  = vi.mocked(prisma.moodPin.update);
const mockDelete  = vi.mocked(prisma.moodPin.delete);

describe('VotesService.recalculateCredibility', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 0.5 when no votes exist', async () => {
    mockGroupBy.mockResolvedValueOnce([]);
    mockUpdate.mockResolvedValueOnce({} as never);

    const score = await recalculateCredibility('pin-uuid-1');

    expect(score).toBe(0.5);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { credibilityScore: 0.5 } }),
    );
  });

  it('calculates 0.8 for 8 confirms and 2 disputes', async () => {
    mockGroupBy.mockResolvedValueOnce([
      { vote: 'CONFIRM', _count: { vote: 8 } } as never,
      { vote: 'DISPUTE', _count: { vote: 2 } } as never,
    ]);
    mockUpdate.mockResolvedValueOnce({} as never);

    const score = await recalculateCredibility('pin-uuid-2');

    expect(score).toBeCloseTo(0.8);
  });

  it('returns 1.0 when all votes are confirms', async () => {
    mockGroupBy.mockResolvedValueOnce([
      { vote: 'CONFIRM', _count: { vote: 10 } } as never,
    ]);
    mockUpdate.mockResolvedValueOnce({} as never);

    const score = await recalculateCredibility('pin-uuid-3');

    expect(score).toBe(1);
  });

  it('signals removal (-1) when dispute ratio exceeds threshold', async () => {
    // 9 disputes vs 1 confirm = ratio of 9, which exceeds AUTO_REMOVE_THRESHOLD (3)
    mockGroupBy.mockResolvedValueOnce([
      { vote: 'CONFIRM', _count: { vote: 1 } } as never,
      { vote: 'DISPUTE', _count: { vote: 9 } } as never,
    ]);
    mockUpdate.mockResolvedValueOnce({} as never);
    mockDelete.mockResolvedValueOnce({} as never);

    const score = await recalculateCredibility('pin-uuid-4');

    expect(score).toBe(-1);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'pin-uuid-4' } });
  });
});

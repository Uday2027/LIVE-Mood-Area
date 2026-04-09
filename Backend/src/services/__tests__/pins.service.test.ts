// src/services/__tests__/pins.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database.js', () => ({
  prisma: {
    moodPin: {
      findMany: vi.fn(),
      create:   vi.fn(),
    },
    neighborhood: {
      findMany: vi.fn(),
    },
  },
}));

// Mock geo utility — always returns null (no neighborhood match)
vi.mock('../../utils/geo.js', () => ({
  isPointInPolygon: vi.fn().mockReturnValue(false),
}));

const { prisma }      = await import('../../config/database.js');
const { getActivePins } = await import('../pins.service.js');

const mockFindMany = vi.mocked(prisma.moodPin.findMany);

describe('PinsService.getActivePins', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls findMany with expiresAt > now filter', async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await getActivePins();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          expiresAt: expect.objectContaining({ gt: expect.any(Date) }),
        }),
      }),
    );
  });

  it('returns an empty array when no active pins exist', async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const result = await getActivePins();

    expect(result).toEqual([]);
  });

  it('returns all pins provided by the DB query', async () => {
    const fakePin = { id: 'pin-1', mood: 'CHILL', credibilityScore: 0.7 };
    mockFindMany.mockResolvedValueOnce([fakePin as never]);

    const result = await getActivePins();

    expect(result).toHaveLength(1);
    expect((result[0] as typeof fakePin).id).toBe('pin-1');
  });
});

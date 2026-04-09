// src/hooks/useSession.ts
import { useMemo } from 'react';
import { getSessionId } from '@/utils/session';

export const useSession = (): string => useMemo(() => getSessionId(), []);

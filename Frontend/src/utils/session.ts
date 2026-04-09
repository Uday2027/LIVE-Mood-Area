// src/utils/session.ts
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'moodmap_session_id';

export const getSessionId = (): string => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

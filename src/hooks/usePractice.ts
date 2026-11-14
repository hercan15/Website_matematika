import { useCallback, useEffect, useRef, useState } from 'react';
import { chapters, type OptionKey } from '../data/questions';

export const STORAGE_KEY = 'raja-jawab:progress:v1';
const QUESTION_TIME = 60_000;

export interface Response {
  answer: OptionKey | null;
  remainingMs: number;
  visited: boolean;
}

export interface PracticeSession {
  chapterId: number;
  currentIndex: number;
  responses: Response[];
  status: 'in-progress' | 'completed';
  startedAt: number;
  updatedAt: number;
  completedAt?: number;
}

interface ActiveClock {
  chapterId: number;
  index: number;
  deadline: number;
}

interface Store {
  version: 1;
  sessions: Record<number, PracticeSession>;
  activeClock: ActiveClock | null;
}

const emptyStore = (): Store => ({ version: 1, sessions: {}, activeClock: null });

function snapshotClock(store: Store) {
  const clock = store.activeClock;
  if (!clock) return;
  const session = store.sessions[clock.chapterId];
  if (!session) { store.activeClock = null; return; }
  session.responses[clock.index].remainingMs = Math.max(0, Math.min(QUESTION_TIME, clock.deadline - Date.now()));
  session.updatedAt = Date.now();
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const data = JSON.parse(raw) as Store;
    if (data.version !== 1 || !data.sessions || typeof data.sessions !== 'object') return emptyStore();
    for (const [id, session] of Object.entries(data.sessions)) {
      if (!chapters.some(chapter => chapter.id === Number(id)) || !session || session.chapterId !== Number(id) ||
        !Array.isArray(session.responses) || session.responses.length !== 25 ||
        !Number.isInteger(session.currentIndex) || session.currentIndex < 0 || session.currentIndex > 24 ||
        !['in-progress', 'completed'].includes(session.status) || session.responses.some(response =>
          !response || !Number.isFinite(response.remainingMs) || response.remainingMs < 0 || response.remainingMs > QUESTION_TIME ||
          typeof response.visited !== 'boolean' || (response.answer !== null && !['A', 'B', 'C', 'D'].includes(response.answer)))) {
        delete data.sessions[Number(id)];
      }
    }
    if (data.activeClock) {
      const clock = data.activeClock;
      if (!Number.isFinite(clock.deadline) || !Number.isInteger(clock.index) || clock.index < 0 || clock.index > 24 || !data.sessions[clock.chapterId]) {
        data.activeClock = null;
      } else {
        snapshotClock(data);
        const session = data.sessions[clock.chapterId];
        if (session.responses[clock.index].remainingMs === 0 && clock.index < 24) {
          session.currentIndex = clock.index + 1;
        }
      }
    }
    data.activeClock = null;
    return data;
  } catch {
    return emptyStore();
  }
}

function createSession(chapterId: number): PracticeSession {
  return {
    chapterId,
    currentIndex: 0,
    responses: Array.from({ length: 25 }, () => ({ answer: null, remainingMs: QUESTION_TIME, visited: false })),
    status: 'in-progress',
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function isHandled(response: Response) {
  return response.visited && (response.answer !== null || response.remainingMs === 0);
}

export function usePractice(onLastTimeout: (chapterId: number) => void) {
  const [store, setStore] = useState<Store>(loadStore);
  const storeRef = useRef(store);
  const onLastTimeoutRef = useRef(onLastTimeout);
  onLastTimeoutRef.current = onLastTimeout;
  const [storageError, setStorageError] = useState(false);

  const commit = useCallback((change: (draft: Store) => void) => {
    const next = structuredClone(storeRef.current);
    change(next);
    storeRef.current = next;
    setStore(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    return next;
  }, []);

  const pause = useCallback(() => {
    if (!storeRef.current.activeClock) return;
    commit(draft => {
      snapshotClock(draft);
      draft.activeClock = null;
    });
  }, [commit]);

  const begin = useCallback((chapterId: number, restart = false) => {
    if (!chapters.some(chapter => chapter.id === chapterId)) return;
    const current = storeRef.current;
    if (!restart && current.activeClock?.chapterId === chapterId) return;
    commit(draft => {
      snapshotClock(draft);
      draft.activeClock = null;
      if (restart || !draft.sessions[chapterId]) draft.sessions[chapterId] = createSession(chapterId);
      const session = draft.sessions[chapterId];
      if (session.status === 'completed') return;
      const response = session.responses[session.currentIndex];
      response.visited = true;
      session.updatedAt = Date.now();
      if (response.remainingMs > 0) {
        draft.activeClock = { chapterId, index: session.currentIndex, deadline: Date.now() + response.remainingMs };
      }
    });
  }, [commit]);

  const openQuestion = useCallback((chapterId: number, index: number) => {
    if (index < 0 || index > 24 || !storeRef.current.sessions[chapterId]) return;
    commit(draft => {
      snapshotClock(draft);
      draft.activeClock = null;
      const session = draft.sessions[chapterId];
      if (session.status === 'completed') return;
      session.currentIndex = index;
      session.responses[index].visited = true;
      session.updatedAt = Date.now();
      if (session.responses[index].remainingMs > 0) {
        draft.activeClock = { chapterId, index, deadline: Date.now() + session.responses[index].remainingMs };
      }
    });
  }, [commit]);

  const chooseAnswer = useCallback((chapterId: number, option: OptionKey) => {
    const current = storeRef.current;
    const session = current.sessions[chapterId];
    if (!session || session.status === 'completed' || !current.activeClock || current.activeClock.chapterId !== chapterId || current.activeClock.deadline <= Date.now()) return;
    commit(draft => {
      snapshotClock(draft);
      const active = draft.sessions[chapterId];
      active.responses[active.currentIndex].answer = option;
      active.updatedAt = Date.now();
    });
  }, [commit]);

  const finish = useCallback((chapterId: number) => {
    const session = storeRef.current.sessions[chapterId];
    if (!session || !session.responses.every(isHandled)) return false;
    commit(draft => {
      snapshotClock(draft);
      draft.activeClock = null;
      draft.sessions[chapterId].status = 'completed';
      draft.sessions[chapterId].completedAt = Date.now();
      draft.sessions[chapterId].updatedAt = Date.now();
    });
    return true;
  }, [commit]);

  useEffect(() => {
    commit(() => {});
  }, [commit]);

  useEffect(() => {
    // A single clock owns the visible question. Absolute deadlines prevent drift
    // and survive a reload, while navigation snapshots the exact unused time.
    const interval = window.setInterval(() => {
      const clock = storeRef.current.activeClock;
      if (!clock) return;
      const remaining = Math.max(0, clock.deadline - Date.now());
      const previous = storeRef.current.sessions[clock.chapterId].responses[clock.index].remainingMs;
      if (Math.ceil(remaining / 1000) === Math.ceil(previous / 1000) && remaining > 0) return;
      let ended = false;
      commit(draft => {
        snapshotClock(draft);
        if (remaining > 0) return;
        const session = draft.sessions[clock.chapterId];
        draft.activeClock = null;
        let nextIndex = clock.index + 1;
        while (nextIndex < 25 && session.responses[nextIndex].remainingMs === 0) nextIndex++;
        if (nextIndex >= 25) { ended = true; return; }
        session.currentIndex = nextIndex;
        session.responses[nextIndex].visited = true;
        draft.activeClock = { chapterId: clock.chapterId, index: nextIndex, deadline: Date.now() + session.responses[nextIndex].remainingMs };
      });
      if (ended) onLastTimeoutRef.current(clock.chapterId);
    }, 150);
    const onPageHide = () => pause();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [commit, pause]);

  return { sessions: store.sessions, activeClock: store.activeClock, storageError, begin, pause, openQuestion, chooseAnswer, finish };
}
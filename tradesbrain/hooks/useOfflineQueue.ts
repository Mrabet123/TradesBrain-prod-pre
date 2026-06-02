// D6 Flow12 S4-S7 — Offline message queue for Rex.
// Stores pending sendMessage payloads per-session in AsyncStorage. The Rex
// session screen renders a queued indicator when this hook reports queued > 0,
// and flushes on reconnect.

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkContext } from '../context/NetworkContext';

export interface QueuedMessage {
  id: string;
  enqueuedAt: number;
  text: string;
  photoUri?: string | null;
  photoBase64?: string | null;
  photoMime?: string | null;
  transcriptOriginal?: string | null;
  transcriptEdited?: string | null;
}

const keyFor = (sessionId: string) => `tb_rex_queue_${sessionId}`;

export function useOfflineQueue(
  sessionId: string | null,
  flush: (msg: QueuedMessage) => Promise<void>,
) {
  const { isConnected } = useNetworkContext();
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [flushing, setFlushing] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(keyFor(sessionId));
        if (raw) setQueue(JSON.parse(raw));
      } catch {
        // corrupt cache; overwrite on next persist
      }
    })();
  }, [sessionId]);

  const persist = useCallback(
    async (next: QueuedMessage[]) => {
      if (!sessionId) return;
      setQueue(next);
      await AsyncStorage.setItem(keyFor(sessionId), JSON.stringify(next));
    },
    [sessionId],
  );

  const enqueue = useCallback(
    async (msg: Omit<QueuedMessage, 'id' | 'enqueuedAt'>) => {
      const entry: QueuedMessage = {
        ...msg,
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        enqueuedAt: Date.now(),
      };
      await persist([...queue, entry]);
    },
    [queue, persist],
  );

  // Re-entrancy guard for the flush loop. We use a ref rather than the `flushing`
  // state so that calling setFlushing(true) does NOT change an effect dependency
  // and re-trigger (and thereby self-cancel) the flush we just started.
  const flushingRef = useRef(false);
  // Keep the latest flush callback in a ref. The screen's flush closure changes
  // identity on every render (it depends on rex.sendMessage), and if it were an
  // effect dependency, each parent re-render would cancel the in-flight flush.
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });

  // Flush whenever we go online (or a stored queue loads while already online).
  useEffect(() => {
    if (!isConnected || queue.length === 0 || flushingRef.current) return;
    flushingRef.current = true;
    setFlushing(true);
    let cancelled = false;
    (async () => {
      // Snapshot at flush-start. We do NOT mutate `queue` during the loop, so the
      // effect won't re-run and cancel us mid-flight.
      const snapshot = [...queue];
      const sentIds: string[] = [];
      for (const item of snapshot) {
        if (cancelled) break;
        try {
          await flushRef.current(item);
          sentIds.push(item.id);
        } catch {
          // Stop on first failure — remaining items stay queued for next time.
          break;
        }
      }
      if (sentIds.length) {
        // Remove every successfully-sent id from the LATEST queue in one
        // functional update, so a flushed message is never re-added off a stale
        // snapshot (the previous clear-one-at-a-time path could resurrect items).
        setQueue((cur) => {
          const next = cur.filter((q) => !sentIds.includes(q.id));
          if (sessionId) {
            AsyncStorage.setItem(keyFor(sessionId), JSON.stringify(next)).catch(() => {
              /* persisted on next change */
            });
          }
          return next;
        });
      }
      flushingRef.current = false;
      setFlushing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isConnected, queue, sessionId]);

  return {
    queued: queue.length,
    flushing,
    enqueue,
    isConnected,
  };
}

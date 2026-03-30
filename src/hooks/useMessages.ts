import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getMessages } from '../queries/forms';
import type { Message } from '../types';

export function useMessages(questionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh from DB — used on mount and after optimistic send fails
  const reload = useCallback(async (qId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(qId);
      setMessages(data);
    } catch (e: any) {
      console.error('getMessages failed:', e);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!questionId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Clear immediately so old messages don't flash while new ones load
    setMessages([]);
    reload(questionId);

    // Realtime: when a new message is inserted, re-fetch that question's
    // messages from DB so we get the fully-mapped Message object (with role,
    // senderName, senderInitial, timestamp). Raw payload.new from Supabase
    // realtime is the raw DB row — it's missing all the joined/computed fields.
    const channel = supabase
      .channel(`messages:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `question_id=eq.${questionId}`,
        },
        () => {
          // Re-fetch the full mapped messages instead of trying to patch raw row
          reload(questionId);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error for', questionId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, reload]);

  return { messages, loading, error, setMessages, reload };
}

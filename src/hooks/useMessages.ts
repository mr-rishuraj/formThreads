import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getMessages } from '../queries/forms';
import type { Message } from '../types';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

export function useMessages(questionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) { setMessages([]); return; }

    setLoading(true);
    setError(null);

    getMessages(questionId)
      .then((data) => { setMessages(data); })
      .catch((e) => {
        console.error('getMessages failed:', e);
        // Show the actual error message, not [object Object]
        setError(typeof e === 'object' && e !== null && 'message' in e
          ? (e as any).message
          : String(e)
        );
      })
      .finally(() => setLoading(false));

    const channel = supabase
      .channel(`messages:${questionId}`)
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `question_id=eq.${questionId}` },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            return exists ? prev : [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [questionId]);

  return { messages, loading, error, setMessages };
}

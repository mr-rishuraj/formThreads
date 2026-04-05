import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getTeamQuestions } from '../queries/questions';
import { getMessages, sendMessage as dbSendMessage } from '../queries/messages';
import type { TeamQuestion, TeamMessage, TeamQuestionStatus } from '../types';

export function useParticipantData(teamId: string, teamName: string) {
  const [questions, setQuestions]   = useState<TeamQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages]     = useState<TeamMessage[]>([]);
  const [loadingQ, setLoadingQ]     = useState(true);
  const [loadingM, setLoadingM]     = useState(false);

  // Refs so real-time callbacks always see latest values without re-subscribing
  const selectedIdRef  = useRef<string | null>(null);
  const questionsRef   = useRef<TeamQuestion[]>([]);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { questionsRef.current  = questions;  }, [questions]);

  // ── 1. Load questions ────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getTeamQuestions(teamId);
      setQuestions(data);
      questionsRef.current = data;
      // Auto-select first if nothing is selected yet
      setSelectedId(prev => {
        if (prev) return prev;           // keep current selection
        return data.length > 0 ? data[0].id : null;
      });
    } catch (e) {
      console.error('getTeamQuestions failed:', e);
    }
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;
    setLoadingQ(true);
    fetchQuestions().finally(() => setLoadingQ(false));
  }, [teamId, fetchQuestions]);

  // ── 2. Real-time: team_questions (INSERT + UPDATE) ────────────
  useEffect(() => {
    if (!teamId) return;

    const ch = supabase
      .channel(`participant:tq:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_questions', filter: `team_id=eq.${teamId}` },
        () => {
          // New question assigned → refetch the full list
          fetchQuestions();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'team_questions', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const row = payload.new as any;
          setQuestions(prev =>
            prev.map(q => q.id === row.id ? { ...q, status: row.status as TeamQuestionStatus } : q)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [teamId, fetchQuestions]);

  // ── 3. Real-time: messages for entire team ────────────────────
  // One persistent channel — uses refs to avoid stale closures
  useEffect(() => {
    if (!teamId) return;

    const ch = supabase
      .channel(`participant:msg:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const row = payload.new as any;
          const currentId  = selectedIdRef.current;
          const currentTQ  = questionsRef.current.find(q => q.id === currentId);
          const isSelected = currentTQ?.questionId === row.question_id;

          if (isSelected) {
            // Refetch messages for the open thread
            getMessages(teamId, row.question_id, teamName)
              .then(setMessages)
              .catch(console.error);
          } else {
            // Mark the other question unread
            setQuestions(prev =>
              prev.map(q => q.questionId === row.question_id ? { ...q, unread: true } : q)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [teamId, teamName]);

  // ── 4. Load messages when question changes ───────────────────
  useEffect(() => {
    if (!selectedId || !teamId) return;

    const tq = questionsRef.current.find(q => q.id === selectedId);
    if (!tq) return;

    setMessages([]);
    setLoadingM(true);
    setQuestions(prev => prev.map(q => q.id === selectedId ? { ...q, unread: false } : q));

    getMessages(teamId, tq.questionId, teamName)
      .then(setMessages)
      .catch(e => console.error('getMessages failed:', e))
      .finally(() => setLoadingM(false));
  }, [selectedId, teamId, teamName]);

  // ── Actions ──────────────────────────────────────────────────
  const selectQuestion = useCallback((id: string) => {
    setSelectedId(id);
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, unread: false } : q));
  }, []);

  const sendReply = useCallback(async (content: string) => {
    if (!selectedId || !teamId) return;
    const tq = questionsRef.current.find(q => q.id === selectedId);
    if (!tq) return;
    await dbSendMessage(teamId, tq.questionId, 'participant', content);
  }, [selectedId, teamId]);

  const selectedQuestion = questions.find(q => q.id === selectedId) ?? null;

  return {
    questions, selectedQuestion, selectedId,
    messages, loadingQ, loadingM,
    selectQuestion, sendReply,
  };
}

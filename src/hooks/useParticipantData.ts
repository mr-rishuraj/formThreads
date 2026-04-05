import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getTeamQuestions, updateTeamQuestionStatus } from '../queries/questions';
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
  const teamNameRef    = useRef<string>(teamName);

  useEffect(() => { selectedIdRef.current = selectedId; },  [selectedId]);
  useEffect(() => { questionsRef.current  = questions;  },  [questions]);
  useEffect(() => { teamNameRef.current   = teamName;   },  [teamName]);

  // ── 1. Load questions ────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    try {
      const data = await getTeamQuestions(teamId);
      setQuestions(data);
      questionsRef.current = data;
      setSelectedId(prev => {
        if (prev) return prev;
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
  // NOTE: No filter on postgres_changes — column filters require REPLICA IDENTITY
  // FULL on the table. We filter in JS instead to avoid silent event drops.
  useEffect(() => {
    if (!teamId) return;

    const ch = supabase
      .channel(`participant:tq:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_questions' },
        (payload) => {
          const row = payload.new as any;
          if (row.team_id !== teamId) return;
          fetchQuestions();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'team_questions' },
        (payload) => {
          const row = payload.new as any;
          if (row.team_id !== teamId) return;
          setQuestions(prev =>
            prev.map(q => q.id === row.id ? { ...q, status: row.status as TeamQuestionStatus } : q)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [teamId, fetchQuestions]);

  // ── 3. Real-time: messages ────────────────────────────────────
  // Persistent channel, no DB-side filter — JS filter on team_id & question_id
  useEffect(() => {
    if (!teamId) return;

    const ch = supabase
      .channel(`participant:msg:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as any;
          if (row.team_id !== teamId) return;  // not our team

          const currentId = selectedIdRef.current;
          const currentTQ = questionsRef.current.find(q => q.id === currentId);
          const isSelected = currentTQ?.questionId === row.question_id;

          if (isSelected) {
            // Replace messages with authoritative DB list (deduplicates optimistic)
            getMessages(teamId, row.question_id, teamNameRef.current)
              .then(setMessages)
              .catch(console.error);
          } else {
            setQuestions(prev =>
              prev.map(q => q.questionId === row.question_id ? { ...q, unread: true } : q)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [teamId]);

  // ── 4. Load messages when selection changes ──────────────────
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
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      if (q.status === 'pending') {
        updateTeamQuestionStatus(id, 'draft').catch(console.error);
        return { ...q, unread: false, status: 'draft' as TeamQuestionStatus };
      }
      return { ...q, unread: false };
    }));
  }, []);

  const sendReply = useCallback(async (content: string) => {
    if (!selectedId || !teamId) return;
    const tq = questionsRef.current.find(q => q.id === selectedId);
    if (!tq) return;

    await dbSendMessage(teamId, tq.questionId, 'participant', content);

    // Optimistic update — show immediately without waiting for real-time
    const name = teamNameRef.current;
    setMessages(prev => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        teamId,
        questionId: tq.questionId,
        sender: 'participant',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        senderName: name,
        senderInitial: name[0]?.toUpperCase() ?? '?',
      } as TeamMessage,
    ]);

    // Belt-and-suspenders: refetch from DB to get the real ID + any concurrent msgs
    getMessages(teamId, tq.questionId, name)
      .then(setMessages)
      .catch(console.error);

    // draft → completed
    if (tq.status !== 'completed') {
      updateTeamQuestionStatus(tq.id, 'completed')
        .then(() =>
          setQuestions(prev =>
            prev.map(q => q.id === tq.id ? { ...q, status: 'completed' as TeamQuestionStatus } : q)
          )
        )
        .catch(console.error);
    }
  }, [selectedId, teamId]);

  const selectedQuestion = questions.find(q => q.id === selectedId) ?? null;

  return {
    questions, selectedQuestion, selectedId,
    messages, loadingQ, loadingM,
    selectQuestion, sendReply,
  };
}

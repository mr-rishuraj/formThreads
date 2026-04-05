import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getTeams, createTeam as dbCreateTeam, deleteTeam as dbDeleteTeam } from '../queries/teams';
import {
  getQuestions, createQuestion as dbCreateQuestion, deleteQuestion as dbDeleteQuestion,
  updateQuestion as dbUpdateQuestion,
  getTeamQuestions, assignQuestionToTeams, unassignQuestionFromTeam,
  updateTeamQuestionStatus as dbUpdateStatus,
  getAssignedTeamIds,
} from '../queries/questions';
import { getMessages, sendMessage as dbSendMessage } from '../queries/messages';
import type { Team, StandaloneQuestion, TeamQuestion, TeamMessage, TeamQuestionStatus } from '../types';

export function useAdminData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<StandaloneQuestion[]>([]);
  const [teamQuestions, setTeamQuestions] = useState<TeamQuestion[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTQId, setSelectedTQId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingTQ, setLoadingTQ] = useState(false);
  const [loadingM, setLoadingM] = useState(false);

  const msgChannelRef    = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const tqChannelRef     = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Refs so real-time callbacks always see fresh values without re-subscribing
  const selectedTeamIdRef = useRef<string | null>(null);
  const selectedTQIdRef   = useRef<string | null>(null);
  const teamQuestionsRef  = useRef<TeamQuestion[]>([]);

  useEffect(() => { selectedTeamIdRef.current = selectedTeamId; }, [selectedTeamId]);
  useEffect(() => { selectedTQIdRef.current   = selectedTQId;   }, [selectedTQId]);
  useEffect(() => { teamQuestionsRef.current  = teamQuestions;  }, [teamQuestions]);

  // ── Bootstrap ─────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getTeams(), getQuestions()])
      .then(([t, q]) => {
        setTeams(t);
        setQuestions(q);
        if (t.length > 0) handleSelectTeam(t[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingTeams(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Select team → load its questions ────────────────────────
  const handleSelectTeam = useCallback(async (teamId: string) => {
    setSelectedTeamId(teamId);
    selectedTeamIdRef.current = teamId;
    setSelectedTQId(null);
    selectedTQIdRef.current = null;
    setMessages([]);
    setLoadingTQ(true);

    if (tqChannelRef.current) {
      supabase.removeChannel(tqChannelRef.current);
    }

    try {
      const tqs = await getTeamQuestions(teamId);
      setTeamQuestions(tqs);
      teamQuestionsRef.current = tqs;
      if (tqs.length > 0) {
        setSelectedTQId(tqs[0].id);
        selectedTQIdRef.current = tqs[0].id;
      }
    } catch (e) {
      console.error('getTeamQuestions failed:', e);
    } finally {
      setLoadingTQ(false);
    }

    // Real-time: team_questions changes for this team
    // No DB-side filter — JS filter to avoid REPLICA IDENTITY requirements
    const ch = supabase
      .channel(`admin:tq:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'team_questions' },
        (payload) => {
          const row = payload.new as any;
          if (row.team_id !== teamId) return;
          setTeamQuestions(prev =>
            prev.map(q => q.id === row.id ? { ...q, status: row.status as TeamQuestionStatus } : q)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_questions' },
        (payload) => {
          const row = payload.new as any;
          if (row.team_id !== teamId) return;
          getTeamQuestions(teamId).then(tqs => {
            setTeamQuestions(tqs);
            teamQuestionsRef.current = tqs;
          }).catch(console.error);
        }
      )
      .subscribe();

    tqChannelRef.current = ch;
  }, []);

  // ── Select team question → load messages ────────────────────
  const handleSelectTQ = useCallback(async (tqId: string) => {
    setSelectedTQId(tqId);
    selectedTQIdRef.current = tqId;

    const tq = teamQuestionsRef.current.find(q => q.id === tqId);
    const teamId = selectedTeamIdRef.current;
    if (!tq || !teamId) return;

    setMessages([]);
    setLoadingM(true);

    if (msgChannelRef.current) {
      supabase.removeChannel(msgChannelRef.current);
    }

    try {
      const msgs = await getMessages(teamId, tq.questionId);
      setMessages(msgs);
    } catch (e) {
      console.error('getMessages failed:', e);
    } finally {
      setLoadingM(false);
    }

    // Real-time: new messages — no DB-side filter, JS filter instead
    const ch = supabase
      .channel(`admin:msg:${teamId}:${tq.questionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as any;
          const currentTeamId = selectedTeamIdRef.current;
          const currentTQId   = selectedTQIdRef.current;
          const currentTQ     = teamQuestionsRef.current.find(q => q.id === currentTQId);

          if (!currentTeamId || !currentTQ) return;
          if (row.team_id !== currentTeamId) return;         // wrong team
          if (row.question_id !== currentTQ.questionId) return; // wrong question

          // Replace with authoritative DB list (deduplicates optimistic message)
          getMessages(currentTeamId, currentTQ.questionId)
            .then(setMessages)
            .catch(console.error);
        }
      )
      .subscribe();

    msgChannelRef.current = ch;
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (msgChannelRef.current) supabase.removeChannel(msgChannelRef.current);
      if (tqChannelRef.current)  supabase.removeChannel(tqChannelRef.current);
    };
  }, []);

  // ── Admin actions ─────────────────────────────────────────────

  const createTeam = useCallback(async (name: string): Promise<Team | null> => {
    try {
      const team = await dbCreateTeam(name);
      setTeams(prev => [team, ...prev]);
      return team;
    } catch (e: any) {
      console.error('createTeam failed:', e);
      return null;
    }
  }, []);

  const removeTeam = useCallback(async (teamId: string): Promise<void> => {
    if (!window.confirm('Delete this team and all its data?')) return;
    await dbDeleteTeam(teamId);
    setTeams(prev => prev.filter(t => t.id !== teamId));
    if (selectedTeamIdRef.current === teamId) {
      setSelectedTeamId(null);
      setTeamQuestions([]);
      setSelectedTQId(null);
      setMessages([]);
    }
  }, []);

  const createQuestion = useCallback(async (title: string, description: string) => {
    try {
      const q = await dbCreateQuestion(title, description);
      setQuestions(prev => [q, ...prev]);
      return q;
    } catch (e: any) {
      const msg = e?.message ?? JSON.stringify(e);
      console.error('createQuestion failed:', msg);
      throw new Error(msg);
    }
  }, []);

  const editQuestion = useCallback(async (
    questionId: string,
    patch: { title?: string; description?: string }
  ) => {
    await dbUpdateQuestion(questionId, patch);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...patch } : q));
    setTeamQuestions(prev => prev.map(q => q.questionId === questionId ? { ...q, ...patch } : q));
  }, []);

  const removeQuestion = useCallback(async (questionId: string) => {
    if (!window.confirm('Delete this question from all teams?')) return;
    await dbDeleteQuestion(questionId);
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setTeamQuestions(prev => prev.filter(q => q.questionId !== questionId));
  }, []);

  const assignToTeams = useCallback(async (questionId: string, teamIds: string[]) => {
    await assignQuestionToTeams(questionId, teamIds);
    const teamId = selectedTeamIdRef.current;
    if (teamId && teamIds.includes(teamId)) {
      const tqs = await getTeamQuestions(teamId);
      setTeamQuestions(tqs);
      teamQuestionsRef.current = tqs;
    }
  }, []);

  const unassignFromTeam = useCallback(async (questionId: string, teamId: string) => {
    await unassignQuestionFromTeam(questionId, teamId);
    setTeamQuestions(prev => prev.filter(q => !(q.questionId === questionId && q.teamId === teamId)));
  }, []);

  const updateStatus = useCallback(async (tqId: string, status: TeamQuestionStatus) => {
    setTeamQuestions(prev => prev.map(q => q.id === tqId ? { ...q, status } : q));
    await dbUpdateStatus(tqId, status);
  }, []);

  const sendReply = useCallback(async (content: string) => {
    const tqId   = selectedTQIdRef.current;
    const teamId = selectedTeamIdRef.current;
    if (!tqId || !teamId) return;

    const tq = teamQuestionsRef.current.find(q => q.id === tqId);
    if (!tq) return;

    await dbSendMessage(teamId, tq.questionId, 'admin', content);

    // Optimistic update — show immediately without waiting for real-time
    setMessages(prev => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        teamId,
        questionId: tq.questionId,
        sender: 'admin',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        senderName: 'Admin',
        senderInitial: 'A',
      } as TeamMessage,
    ]);

    // Belt-and-suspenders: refetch from DB to get real ID + any concurrent msgs
    getMessages(teamId, tq.questionId)
      .then(setMessages)
      .catch(console.error);
  }, []);

  const getAssigned = useCallback((questionId: string) => getAssignedTeamIds(questionId), []);

  const selectedTQ = teamQuestions.find(q => q.id === selectedTQId) ?? null;

  return {
    teams, questions, teamQuestions, messages,
    selectedTeamId, selectedTQ,
    loadingTeams, loadingTQ, loadingM,
    selectTeam: handleSelectTeam,
    selectTQ: handleSelectTQ,
    createTeam, removeTeam,
    createQuestion, editQuestion, removeQuestion,
    assignToTeams, unassignFromTeam, getAssigned,
    updateStatus,
    sendReply,
  };
}

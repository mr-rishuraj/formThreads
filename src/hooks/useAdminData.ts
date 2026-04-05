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
  const msgChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const tqChannelRef  = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
    setSelectedTQId(null);
    setMessages([]);
    setLoadingTQ(true);

    if (tqChannelRef.current) {
      supabase.removeChannel(tqChannelRef.current);
    }

    try {
      const tqs = await getTeamQuestions(teamId);
      setTeamQuestions(tqs);
      if (tqs.length > 0) setSelectedTQId(tqs[0].id);
    } catch (e) {
      console.error('getTeamQuestions failed:', e);
    } finally {
      setLoadingTQ(false);
    }

    // Real-time: status changes for this team's questions
    const ch = supabase
      .channel(`admin:tq:${teamId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'team_questions', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const row = payload.new as any;
          setTeamQuestions(prev =>
            prev.map(q => q.id === row.id ? { ...q, status: row.status as TeamQuestionStatus } : q)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_questions', filter: `team_id=eq.${teamId}` },
        () => {
          getTeamQuestions(teamId).then(setTeamQuestions).catch(console.error);
        }
      )
      .subscribe();

    tqChannelRef.current = ch;
  }, []);

  // ── Select team question → load messages ────────────────────
  const handleSelectTQ = useCallback(async (tqId: string) => {
    setSelectedTQId(tqId);
    const tq = teamQuestions.find(q => q.id === tqId);
    if (!tq || !selectedTeamId) return;

    setMessages([]);
    setLoadingM(true);

    if (msgChannelRef.current) {
      supabase.removeChannel(msgChannelRef.current);
    }

    try {
      const msgs = await getMessages(selectedTeamId, tq.questionId);
      setMessages(msgs);
    } catch (e) {
      console.error('getMessages failed:', e);
    } finally {
      setLoadingM(false);
    }

    // Real-time: new messages
    const ch = supabase
      .channel(`admin:msg:${selectedTeamId}:${tq.questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `team_id=eq.${selectedTeamId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.question_id !== tq.questionId) return;
          getMessages(selectedTeamId, tq.questionId)
            .then(setMessages)
            .catch(console.error);
        }
      )
      .subscribe();

    msgChannelRef.current = ch;
  }, [teamQuestions, selectedTeamId]);

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
    if (selectedTeamId === teamId) {
      setSelectedTeamId(null);
      setTeamQuestions([]);
      setSelectedTQId(null);
      setMessages([]);
    }
  }, [selectedTeamId]);

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
    if (selectedTeamId && teamIds.includes(selectedTeamId)) {
      const tqs = await getTeamQuestions(selectedTeamId);
      setTeamQuestions(tqs);
    }
  }, [selectedTeamId]);

  const unassignFromTeam = useCallback(async (questionId: string, teamId: string) => {
    await unassignQuestionFromTeam(questionId, teamId);
    setTeamQuestions(prev => prev.filter(q => !(q.questionId === questionId && q.teamId === teamId)));
  }, []);

  const updateStatus = useCallback(async (tqId: string, status: TeamQuestionStatus) => {
    setTeamQuestions(prev => prev.map(q => q.id === tqId ? { ...q, status } : q));
    await dbUpdateStatus(tqId, status);
  }, []);

  const sendReply = useCallback(async (content: string) => {
    if (!selectedTQId || !selectedTeamId) return;
    const tq = teamQuestions.find(q => q.id === selectedTQId);
    if (!tq) return;
    await dbSendMessage(selectedTeamId, tq.questionId, 'admin', content);
  }, [selectedTQId, selectedTeamId, teamQuestions]);

  const getAssigned = useCallback((questionId: string) => getAssignedTeamIds(questionId), []);

  const selectedTQ = teamQuestions.find(q => q.id === selectedTQId) ?? null;

  return {
    // data
    teams, questions, teamQuestions, messages,
    selectedTeamId, selectedTQ,
    loadingTeams, loadingTQ, loadingM,
    // selection
    selectTeam: handleSelectTeam,
    selectTQ: handleSelectTQ,
    // team actions
    createTeam, removeTeam,
    // question actions
    createQuestion, editQuestion, removeQuestion,
    assignToTeams, unassignFromTeam, getAssigned,
    // status
    updateStatus,
    // messaging
    sendReply,
  };
}

import { useState, useCallback, useEffect } from 'react';
import {
  getMyForms,
  getQuestions,
  createForm as dbCreateForm,
  createQuestion as dbCreateQuestion,
  updateQuestionInDB,
  sendMessage,
  getParticipantInfo,
  getFormsForMyTeam,
  deleteForm as dbDeleteForm,
} from '../queries/forms';
import { supabase } from '../lib/supabase';
import type { Form, Question } from '../types';

const FORM_ICONS = ['◈', '◉', '◎', '◇', '◆', '◐', '◑'];

interface UseFormThreadOptions {
  isAdmin: boolean;
  teamId: string | null;
}

export function useFormThread({ isAdmin, teamId }: UseFormThreadOptions) {
  const [forms, setForms] = useState<Form[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Awaiting' | 'Answered'>('All');
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ── Load forms (fetch only, no realtime here) ──────────────
  useEffect(() => {
    setLoadingForms(true);

    const load = async () => {
      try {
        let allForms = await getMyForms();

        if (!isAdmin) {
          if (!teamId) {
            setForms([]);
            setLoadingForms(false);
            return;
          }
          const teamFormIds = await getFormsForMyTeam();
          allForms = allForms.filter((f) => teamFormIds.includes(f.id));
        }

        const enriched = await Promise.all(
          allForms.map(async (form, i) => {
            let respondentName = 'Respondent';
            let respondentEmail = '';
            try {
              const info = await getParticipantInfo(form.id);
              respondentName = info.respondentName;
              respondentEmail = info.respondentEmail;
            } catch (_) {}
            const icon = FORM_ICONS[i % FORM_ICONS.length];
            return { ...form, respondentName, respondentEmail, icon };
          })
        );

        setForms(enriched);
        if (enriched.length > 0) setSelectedFormId(enriched[0].id);
      } catch (e) {
        console.error('getMyForms failed:', e);
      } finally {
        setLoadingForms(false);
      }
    };

    load();
  }, [isAdmin, teamId]); // ← no realtime here, just fetch

  // ── Forms realtime — separate effect, subscribes once ─────
  useEffect(() => {
    const formsChannel = supabase
      .channel('forms:realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forms' },
        (payload) => {
          const f = payload.new as any;
          setForms((prev) => {
            if (prev.some((form) => form.id === f.id)) return prev;
            return [{
              id: f.id,
              name: f.title,
              description: '',
              createdAt: f.created_at?.split('T')[0] ?? '',
              questionCount: 0,
              respondentName: 'Respondent',
              respondentEmail: '',
              icon: FORM_ICONS[prev.length % FORM_ICONS.length],
            }, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'forms' },
        (payload) => {
          const f = payload.new as any;
          setForms((prev) =>
            prev.map((form) =>
              form.id === f.id ? { ...form, name: f.title } : form
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'forms' },
        (payload) => {
          setForms((prev) => prev.filter((form) => form.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log('Forms realtime:', status);
      });

    return () => {
      supabase.removeChannel(formsChannel);
    };
  }, []); // ← empty deps — stays alive for the entire session

  // ── Load questions + realtime ──────────────────────────────
  useEffect(() => {
    if (!selectedFormId) return;

    setLoadingQuestions(true);
    setSelectedQuestionId(null);

    getQuestions(selectedFormId)
      .then((data) => {
        setQuestions((prev) => {
          const others = prev.filter((q) => q.formId !== selectedFormId);
          return [...others, ...data];
        });
        if (data.length > 0) setSelectedQuestionId(data[0].id);
      })
      .catch((e) => console.error('getQuestions failed:', e))
      .finally(() => setLoadingQuestions(false));

    const channel = supabase
      .channel(`questions:${selectedFormId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `form_id=eq.${selectedFormId}`,
        },
        (payload) => {
          const q = payload.new as any;
          setQuestions((prev) => {
            if (prev.some((item) => item.id === q.id)) return prev;
            return [...prev, {
              id: q.id,
              formId: q.form_id,
              title: q.title,
              description: q.description ?? '',
              messages: [],
              status: 'unanswered' as const,
              unread: true,
              lastActivity: 'Just now',
            }];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `form_id=eq.${selectedFormId}`,
        },
        (payload) => {
          const q = payload.new as any;
          setQuestions((prev) =>
            prev.map((item) =>
              item.id === q.id
                ? { ...item, title: q.title, description: q.description ?? '' }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedFormId]);

  // ── Derived ────────────────────────────────────────────────
  const selectedForm = forms.find((f) => f.id === selectedFormId) ?? null;
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) ?? null;

  const visibleQuestions = questions.filter((q) => {
    if (q.formId !== selectedFormId) return false;
    if (activeTab === 'Awaiting') return q.status === 'unanswered';
    if (activeTab === 'Answered') return q.status === 'answered';
    return true;
  });

  // ── Actions ────────────────────────────────────────────────
  const selectForm = useCallback((formId: string) => {
    setSelectedFormId(formId);
    setActiveTab('All');
  }, []);

  const selectQuestion = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId);
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, unread: false } : q))
    );
  }, []);

  const sendReply = useCallback(async (questionId: string, content: string) => {
    if (!content.trim()) return;
    try {
      await sendMessage(questionId, content);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, status: 'answered' as const, lastActivity: 'Just now', unread: false }
            : q
        )
      );
    } catch (e) {
      console.error('sendMessage failed:', e);
      alert('Failed to send reply. Check console for details.');
    }
  }, []);

  const unreadCount = useCallback(
    (formId: string) => questions.filter((q) => q.formId === formId && q.unread).length,
    [questions]
  );

  const createForm = useCallback(async (name: string) => {
    try {
      const id = await dbCreateForm(name);
      const icon = FORM_ICONS[Math.floor(Math.random() * FORM_ICONS.length)];
      const newForm: Form = {
        id, name: name.trim(), description: '',
        createdAt: new Date().toISOString().slice(0, 10),
        questionCount: 0, respondentName: 'Respondent',
        respondentEmail: '', icon,
      };
      setForms((prev) => [newForm, ...prev]);
      setSelectedFormId(id);
      setSelectedQuestionId(null);
      setActiveTab('All');
    } catch (e) {
      console.error('createForm failed:', e);
      alert('Failed to create form.');
    }
  }, []);

  const addQuestion = useCallback(async (formId: string, title: string) => {
    try {
      const existingCount = questions.filter((q) => q.formId === formId).length;
      const id = await dbCreateQuestion(formId, title, existingCount);
      const newQ: Question = {
        id, formId,
        title: title.trim() || 'Untitled Question',
        description: '', messages: [],
        status: 'unanswered', unread: false, lastActivity: 'Just now',
      };
      setQuestions((prev) => [...prev, newQ]);
      setSelectedQuestionId(id);
      return id;
    } catch (e) {
      console.error('addQuestion failed:', e);
      alert('Failed to add question.');
    }
  }, [questions]);

  const updateQuestion = useCallback(
    async (questionId: string, patch: Partial<Pick<Question, 'title' | 'description'>>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...patch } : q))
      );
      try {
        await updateQuestionInDB(questionId, patch);
      } catch (e) {
        console.error('updateQuestion failed:', e);
      }
    },
    []
  );

  const removeForm = useCallback(async (formId: string) => {
    if (!window.confirm('Delete this form? This will also delete all its questions and messages.')) return;
    try {
      await dbDeleteForm(formId);
      setForms((prev) => prev.filter((f) => f.id !== formId));
      setQuestions((prev) => prev.filter((q) => q.formId !== formId));
      if (selectedFormId === formId) {
        setSelectedFormId(null);
        setSelectedQuestionId(null);
      }
    } catch (e) {
      console.error('deleteForm failed:', e);
      alert('Failed to delete form.');
    }
  }, [selectedFormId]);

  return {
    forms, visibleQuestions, allQuestions: questions,
    selectedForm, selectedQuestion, selectedFormId, selectedQuestionId,
    activeTab, setActiveTab, selectForm, selectQuestion,
    sendReply, unreadCount, createForm, addQuestion, updateQuestion,
    loadingForms, loadingQuestions,
    setForms,
    removeForm,
  };
}
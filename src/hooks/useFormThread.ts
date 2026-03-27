import { useState, useCallback, useEffect } from 'react';
import {
  getMyForms,
  getQuestions,
  createForm as dbCreateForm,
  createQuestion as dbCreateQuestion,
  updateQuestionInDB,
  sendMessage,
  getParticipantInfo,
} from '../queries/forms';
import type { Form, Question } from '../types';

const FORM_ICONS = ['◈', '◉', '◎', '◇', '◆', '◐', '◑'];

export function useFormThread() {
  const [forms, setForms] = useState<Form[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Awaiting' | 'Answered'>('All');
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ── Load forms on mount ────────────────────────────────────
  useEffect(() => {
    setLoadingForms(true);
    getMyForms()
      .then(async (data) => {
        const enriched = await Promise.all(
          data.map(async (form, i) => {
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
      })
      .catch((e) => console.error('getMyForms failed:', e))
      .finally(() => setLoadingForms(false));
  }, []);

  // ── Load questions when form changes ───────────────────────
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
      alert('Failed to create form. Check console for details.');
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
      alert('Failed to add question. Check console for details.');
    }
  }, [questions]);

  const updateQuestion = useCallback(
    async (questionId: string, patch: Partial<Pick<Question, 'title' | 'description'>>) => {
      // Optimistic update immediately
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

  return {
    forms, visibleQuestions, allQuestions: questions,
    selectedForm, selectedQuestion, selectedFormId, selectedQuestionId,
    activeTab, setActiveTab, selectForm, selectQuestion,
    sendReply, unreadCount, createForm, addQuestion, updateQuestion,
    loadingForms, loadingQuestions,
  };
}

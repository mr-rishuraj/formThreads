import { Form, Question } from '../types';

export const MOCK_FORMS: Form[] = [
  {
    id: 'form-1',
    name: 'Series A Due Diligence',
    description: 'Investor questionnaire for funding round',
    createdAt: '2024-01-10',
    questionCount: 5,
    respondentName: 'Arjun Mehta',
    respondentEmail: 'arjun@nexaralabs.com',
    icon: '◈',
  },
  {
    id: 'form-2',
    name: 'Product Design Brief',
    description: 'Onboarding questions for new clients',
    createdAt: '2024-01-14',
    questionCount: 3,
    respondentName: 'Sara Lind',
    respondentEmail: 'sara@lind-studio.com',
    icon: '◉',
  },
  {
    id: 'form-3',
    name: 'Engineering Hiring Loop',
    description: 'Technical screening & culture fit',
    createdAt: '2024-01-18',
    questionCount: 3,
    respondentName: 'Devraj Kapoor',
    respondentEmail: 'devraj@gmail.com',
    icon: '◎',
  },
];

export const MOCK_QUESTIONS: Question[] = [
  // ── Form 1 ──────────────────────────────────────────────
  {
    id: 'q-1-1',
    formId: 'form-1',
    title: 'Describe your current revenue model and traction.',
    description:
      'We want to understand how the business generates revenue today — ARR, MRR, growth rate, and any notable customer logos or cohorts. Please be specific.',
    status: 'answered',
    unread: false,
    lastActivity: '2h ago',
    messages: [
      {
        id: 'm-1',
        role: 'creator',
        content:
          'We want to understand how the business generates revenue today — ARR, MRR, growth rate, and any notable customer logos or cohorts. Please be specific.',
        timestamp: 'Jan 12, 9:00 AM',
        senderName: 'Riya Sharma (Investor)',
        senderInitial: 'R',
      },
      {
        id: 'm-2',
        role: 'respondent',
        content:
          "Currently at $1.2M ARR, growing 18% MoM for the last 6 months. We run a usage-based SaaS model — customers pay per API call with a $499/mo minimum. Top logos include Razorpay, Delhivery, and three Series B startups. Net revenue retention is 118%.",
        timestamp: 'Jan 12, 11:34 AM',
        senderName: 'Arjun Mehta',
        senderInitial: 'A',
      },
      {
        id: 'm-3',
        role: 'creator',
        content:
          'That NRR is impressive. Can you break down the 18% MoM — is that new logo acquisition or expansion from existing accounts?',
        timestamp: 'Jan 12, 2:15 PM',
        senderName: 'Riya Sharma',
        senderInitial: 'R',
      },
      {
        id: 'm-4',
        role: 'respondent',
        content:
          "Roughly 60% expansion, 40% new logos. Existing customers keep increasing their usage as they scale. Razorpay alone went from $2k/mo to $18k/mo over 8 months. We've barely started outbound — most growth is inbound + word of mouth.",
        timestamp: 'Jan 12, 4:02 PM',
        senderName: 'Arjun Mehta',
        senderInitial: 'A',
      },
    ],
  },
  {
    id: 'q-1-2',
    formId: 'form-1',
    title: 'What is your competitive moat and defensibility?',
    description:
      'Explain what makes Nexara hard to replicate. Technical, data, network effects, go-to-market advantages — be candid about where you are strong and where you are still building.',
    status: 'needs-clarification',
    unread: true,
    lastActivity: '45m ago',
    messages: [
      {
        id: 'm-5',
        role: 'creator',
        content:
          "Explain what makes Nexara hard to replicate — technical, data, network effects, GTM. Be candid about where you're strong and where you're still building.",
        timestamp: 'Jan 13, 10:00 AM',
        senderName: 'Riya Sharma (Investor)',
        senderInitial: 'R',
      },
      {
        id: 'm-6',
        role: 'respondent',
        content:
          "Primary moat is data — we've processed 4B+ transactions across our customers, which trains our fraud detection model. Each new customer makes the model better for everyone. Technical switching costs are high: average integration is 3 weeks.",
        timestamp: 'Jan 13, 1:20 PM',
        senderName: 'Arjun Mehta',
        senderInitial: 'A',
      },
      {
        id: 'm-7',
        role: 'creator',
        content:
          "The data flywheel is compelling. What stops a well-funded competitor from replicating this in 18 months if they acquire a comparable dataset? Is the 'India-specific' angle temporary or structural?",
        timestamp: 'Jan 13, 3:45 PM',
        senderName: 'Riya Sharma',
        senderInitial: 'R',
      },
    ],
  },
  {
    id: 'q-1-3',
    formId: 'form-1',
    title: 'Walk us through your founding team and domain expertise.',
    description:
      'Background on each co-founder, what they built before, and why this team is positioned to win.',
    status: 'answered',
    unread: false,
    lastActivity: '1d ago',
    messages: [
      {
        id: 'm-8',
        role: 'creator',
        content:
          'Background on each co-founder, what they built before, and why this team specifically is positioned to win in this market.',
        timestamp: 'Jan 11, 9:00 AM',
        senderName: 'Riya Sharma (Investor)',
        senderInitial: 'R',
      },
      {
        id: 'm-9',
        role: 'respondent',
        content:
          "Three co-founders: myself (Arjun) — ex-Razorpay Staff Engineer, built their risk scoring system handling ₹80k Cr/year. Priya (CTO) — PhD ML from IISc, ex-Google Brain, 4 patents. Rishi (GTM) — ex-Stripe India, drove 60% of their enterprise revenue. We've known each other 6 years and shipped together before.",
        timestamp: 'Jan 11, 3:00 PM',
        senderName: 'Arjun Mehta',
        senderInitial: 'A',
      },
    ],
  },
  {
    id: 'q-1-4',
    formId: 'form-1',
    title: 'Use of funds and 18-month milestones.',
    description:
      'How will the $8M be allocated? What does success look like at the end of the Series A runway?',
    status: 'unanswered',
    unread: true,
    lastActivity: '3h ago',
    messages: [
      {
        id: 'm-10',
        role: 'creator',
        content:
          "How will the $8M be allocated across engineering, GTM, and ops? What does 'success' look like at the end of the Series A runway — be specific about targets, not just directional.",
        timestamp: 'Jan 14, 8:30 AM',
        senderName: 'Riya Sharma (Investor)',
        senderInitial: 'R',
      },
    ],
  },
  {
    id: 'q-1-5',
    formId: 'form-1',
    title: 'Key risks you are most concerned about.',
    description:
      'Be honest. What keeps you up at night — regulatory, competitive, technical, or market risk?',
    status: 'unanswered',
    unread: false,
    lastActivity: '5h ago',
    messages: [
      {
        id: 'm-11',
        role: 'creator',
        content:
          "Be honest. What keeps you up at night? List your top 3 risks — regulatory exposure, competitive dynamics, technical debt, key-person dependency. We respect founders who can clearly articulate their own risks.",
        timestamp: 'Jan 14, 9:00 AM',
        senderName: 'Riya Sharma (Investor)',
        senderInitial: 'R',
      },
    ],
  },

  // ── Form 2 ──────────────────────────────────────────────
  {
    id: 'q-2-1',
    formId: 'form-2',
    title: 'What problem are we solving and for whom?',
    description:
      'Describe the core problem in 2-3 sentences. Who is the primary user — their role, context, pain.',
    status: 'answered',
    unread: false,
    lastActivity: '3d ago',
    messages: [
      {
        id: 'm-20',
        role: 'creator',
        content:
          'Describe the core problem in 2-3 sentences. Who is the primary user — their role, daily context, and specific pain point.',
        timestamp: 'Jan 9, 10:00 AM',
        senderName: 'Kaito Design',
        senderInitial: 'K',
      },
      {
        id: 'm-21',
        role: 'respondent',
        content:
          "Independent architects spend 40% of their time on client communication and revision management. The primary user is a solo or 2-person firm running 3-8 projects simultaneously. They lose projects not because of bad design, but broken communication workflows.",
        timestamp: 'Jan 9, 4:15 PM',
        senderName: 'Sara Lind',
        senderInitial: 'S',
      },
    ],
  },
  {
    id: 'q-2-2',
    formId: 'form-2',
    title: 'Brand direction — words and references.',
    description:
      '5 adjectives describing the desired brand feeling. Visual references, competitors you admire, aesthetics to avoid.',
    status: 'needs-clarification',
    unread: true,
    lastActivity: '1d ago',
    messages: [
      {
        id: 'm-22',
        role: 'creator',
        content:
          '5 adjectives describing desired brand feeling. Visual references, mood boards, competitors you admire aesthetically, and things to explicitly avoid.',
        timestamp: 'Jan 10, 9:30 AM',
        senderName: 'Kaito Design',
        senderInitial: 'K',
      },
      {
        id: 'm-23',
        role: 'respondent',
        content:
          "Precise. Calm. Considered. Premium without luxury. Honest. References: Notion's early brand, Linear's UI philosophy, Muji catalog aesthetic. Avoid gradients, bubbly UI, or SaaS-blue. Think 'architect's drafting table' not 'startup dashboard'.",
        timestamp: 'Jan 10, 2:00 PM',
        senderName: 'Sara Lind',
        senderInitial: 'S',
      },
      {
        id: 'm-24',
        role: 'creator',
        content:
          "Love the drafting table direction. Quick clarification — when you say 'precise', do you mean visual precision (tight grid, sharp edges) or precision in copy tone? Both inform different design decisions.",
        timestamp: 'Jan 10, 3:30 PM',
        senderName: 'Kaito Design',
        senderInitial: 'K',
      },
    ],
  },
  {
    id: 'q-2-3',
    formId: 'form-2',
    title: 'Timeline and launch constraints.',
    description: 'Desired launch date, hard deadlines, and internal stakeholder milestones.',
    status: 'unanswered',
    unread: false,
    lastActivity: '2d ago',
    messages: [
      {
        id: 'm-25',
        role: 'creator',
        content:
          'What is your desired launch date? Are there hard deadlines tied to events or investor commitments? Flag any internal milestone reviews we need to plan around.',
        timestamp: 'Jan 11, 11:00 AM',
        senderName: 'Kaito Design',
        senderInitial: 'K',
      },
    ],
  },

  // ── Form 3 ──────────────────────────────────────────────
  {
    id: 'q-3-1',
    formId: 'form-3',
    title: 'Tell us about the most complex system you have built.',
    description:
      'Not the most impressive — the most complex. Walk through architecture decisions, tradeoffs, and what you would do differently.',
    status: 'answered',
    unread: false,
    lastActivity: '6h ago',
    messages: [
      {
        id: 'm-30',
        role: 'creator',
        content:
          "Not the most impressive — the most complex. Walk us through the architecture, key design decisions, tradeoffs made under constraint, and honestly — what you'd do differently now.",
        timestamp: 'Jan 15, 9:00 AM',
        senderName: 'Hiring Team',
        senderInitial: 'H',
      },
      {
        id: 'm-31',
        role: 'respondent',
        content:
          "Built a real-time collaborative code review tool. The hardest part was the operational transform layer for concurrent edits — 8 engineers editing the same file simultaneously. Started with last-write-wins and it was a disaster. Rebuilt with CRDTs (Yjs), which added 3 weeks but eliminated an entire class of bugs. Would start with CRDTs from day one next time.",
        timestamp: 'Jan 15, 1:00 PM',
        senderName: 'Devraj Kapoor',
        senderInitial: 'D',
      },
    ],
  },
  {
    id: 'q-3-2',
    formId: 'form-3',
    title: 'How do you debug a problem you have never seen before?',
    description:
      'Walk us through your actual mental model and process — not a textbook answer.',
    status: 'needs-clarification',
    unread: true,
    lastActivity: '2h ago',
    messages: [
      {
        id: 'm-32',
        role: 'creator',
        content:
          "Walk us through your actual mental model and debugging process for an unknown problem. Not the textbook answer — what do you actually do in the first 10 minutes?",
        timestamp: 'Jan 15, 2:00 PM',
        senderName: 'Hiring Team',
        senderInitial: 'H',
      },
      {
        id: 'm-33',
        role: 'respondent',
        content:
          "First 10 minutes: reproduce it reliably. Can't debug a ghost. Once I have a reproducible case, I binary search the call stack — not randomly adding console.logs. I form one hypothesis at a time and test it to destruction before moving to the next.",
        timestamp: 'Jan 15, 4:30 PM',
        senderName: 'Devraj Kapoor',
        senderInitial: 'D',
      },
      {
        id: 'm-34',
        role: 'creator',
        content:
          "Good framework. Follow-up: give a specific example where your initial hypothesis was completely wrong and how you recovered from that?",
        timestamp: 'Jan 15, 5:00 PM',
        senderName: 'Hiring Team',
        senderInitial: 'H',
      },
    ],
  },
  {
    id: 'q-3-3',
    formId: 'form-3',
    title: 'What does great engineering culture look like to you?',
    description: 'Be specific. What have you seen work? What have you seen fail?',
    status: 'unanswered',
    unread: true,
    lastActivity: '30m ago',
    messages: [
      {
        id: 'm-35',
        role: 'creator',
        content:
          "Be specific — not generic. What actual behaviors, rituals, or norms define a great engineering culture? What have you personally seen work? What patterns do you avoid?",
        timestamp: 'Jan 16, 10:00 AM',
        senderName: 'Hiring Team',
        senderInitial: 'H',
      },
    ],
  },
];

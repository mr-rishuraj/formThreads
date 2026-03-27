# FormThread — React + Tailwind CSS

A Gmail-inspired conversational form interface with authentication and role-based access control.

## Tech Stack

- **React 18** (Create React App)
- **TypeScript**
- **Tailwind CSS v3**
- No external UI libraries, no router library (manual auth gate)

## Project Structure

```
src/
├── types/
│   └── index.ts                # TypeScript interfaces — Form, Question, Message, User, UserRole
├── data/
│   └── mockData.ts             # Hardcoded mock forms, questions, messages
├── hooks/
│   ├── useFormThread.ts        # Form/question state management
│   └── useUser.ts              # Auth state — reads/writes localStorage, assigns roles
├── components/
│   ├── AuthPage.tsx            # /auth — Google sign-in UI with demo account picker
│   ├── Sidebar.tsx             # Left panel — role-aware: admin gets "+ Create Form"
│   ├── QuestionList.tsx        # Middle panel — filterable question list
│   ├── QuestionItem.tsx        # Single question row
│   ├── MessageBubble.tsx       # Individual message bubble
│   ├── ReplyBox.tsx            # Reply textarea
│   └── ThreadView.tsx          # Right panel — admin sees "edit" affordance
├── App.tsx                     # Route guard + role-filtered Dashboard
├── index.tsx                   # React entry point
└── index.css                   # Global styles
```

## Getting Started

```bash
npm install
npm start
```

## Auth & Role System

### How it works

1. User lands on auth screen → picks a demo account → clicks "Continue with Google"
2. `useUser.login(email)` calls `buildUser(email)` which assigns a role based on the email
3. User object is persisted to `localStorage` under key `formthread_user`
4. `App.tsx` reads `useUser()` — if no user, renders `<AuthPage>`, otherwise `<Dashboard>`
5. Sign out clears localStorage and returns to auth screen

### Role assignment (mock logic in `useUser.ts`)

| Email | Role |
|-------|------|
| `admin@formthread.io` | admin |
| `riya@formthread.io` | admin |
| `creator@formthread.io` | admin |
| `arjun@nexaralabs.com` | participant → form-1 only |
| `sara@lind-studio.com` | participant → form-2 only |
| `devraj@gmail.com` | participant → form-3 only |
| any other email | participant → form-1 (default) |

### Role-based UI differences

| Feature | Admin | Participant |
|---------|-------|-------------|
| Sidebar: "+ Create Form" button | ✅ visible | ❌ hidden |
| Sidebar: form list | All forms | Assigned forms only |
| Thread: "edit" button on question | ✅ visible | ❌ hidden |
| Reply box | ✅ replies as self | ✅ replies as self |
| Footer: role badge | `admin` (amber) | `participant` (gray) |

### To hook up real auth later

Replace `buildUser()` in `useUser.ts` with your OAuth provider's user object.
The `User` interface in `types/index.ts` maps cleanly to any JWT payload.


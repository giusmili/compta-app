# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview the production build
npm run lint      # ESLint on all .ts/.tsx files
```

Also: `npm run typecheck` (tsc) and `npm test` (Vitest, `tests/`).

## Environment variables

Create `.env.local` (and set the same variables in Vercel → Settings → Environment Variables; they are read server-side only, never bundled):
```
API_KEY_CLAUDE=sk-ant-...   # Anthropic API key (used by claudeService.ts)
OPENAI_API_KEY=sk-...        # OpenAI key (used by openaiService.ts)
CHAT_PROVIDER=claude         # 'claude' (default) or 'openai'
```

## Architecture

**ComptaExpert AI** is a French accounting simulator for entrepreneurs (micro-entrepreneur, SASU, EURL). All data is persisted in `localStorage` under the key `compta_data`.

### Data flow

```
AppState (localStorage)
  └─ calculateFinancials()  →  FinancialStats
       └─ displayed in SummaryCards, BarChart, and passed as context to ChatModal
```

`AppState` holds `transactions[]`, `status` (BusinessStatus enum), and `customChargeRate`. All state lives in `App.tsx` — no global store.

### Key files

| File | Role |
|---|---|
| `types.ts` | All shared types: `Transaction`, `AppState`, `FinancialStats`, `BusinessStatus` |
| `constants.ts` | French URSSAF 2025 social charge rates per `BusinessStatus` and transaction categories |
| `utils/calculations.ts` | `calculateFinancials(state)` — derives all financial metrics; social charges apply to revenue, not profit |
| `services/chatService.ts` | Browser side: `fetch('/api/chat')` only — no API key in the bundle |
| `api/chat.ts` + `api/_lib/handler.ts` | Vercel serverless function: validates input, builds the system prompt + financial context, calls Anthropic or OpenAI (`CHAT_PROVIDER`) with keys from server env, basic per-IP rate limit |
| `shared/chat.ts` | Types and limits shared by front and API |
| `components/ChatModal.tsx` | Maintains **two separate message arrays**: `displayMessages` (includes welcome message shown in UI) and `apiMessages` (only actual conversation turns sent to the API) |

### Styling

Tailwind CSS v4 is built through `@tailwindcss/vite` (entry: `index.css`). Chat animations and markdown styles live in `components/chat.css`.

### Vite configuration note

`vite.config.ts` has a dev-only `dev-api-chat` plugin that serves `/api/chat` with the same handler as the Vercel function, loading `.env.local` into the server process (never into the client bundle).

### Social charge calculation

For all statuses (including SASU/EURL), charges are simplified as `totalRevenue × chargeRate`. This is a simulation, not exact legal accounting.

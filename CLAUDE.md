# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview the production build
npm run lint      # ESLint on all .ts/.tsx files
```

No test framework is configured.

## Environment variables

Create `.env.local` with:
```
API_KEY_CLAUDE=sk-ant-...   # Anthropic API key (used by claudeService.ts)
GEMINI_API_KEY=...           # Google Gemini key (used by geminiService.ts, currently unused in UI)
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
| `services/claudeService.ts` | Calls Anthropic API directly from the browser (`dangerouslyAllowBrowser: true`); `sendChatMessage` receives the conversation history + live financial context as system prompt injection |
| `services/geminiService.ts` | Gemini integration (`@google/genai`); implemented but not wired to any UI component currently |
| `components/ChatModal.tsx` | Maintains **two separate message arrays**: `displayMessages` (includes welcome message shown in UI) and `apiMessages` (only actual conversation turns sent to the API) |

### Styling

Tailwind CSS is loaded via CDN in `index.html` — there is no `tailwind.config.js` or PostCSS pipeline. Custom CSS is injected as a `<style>` tag inside `ChatModal.tsx` (for chat animations and markdown rendering).

### Vite configuration note

`vite.config.ts` includes a custom `stubNodeBuiltins` plugin that intercepts all `node:*` imports. This is required because `@anthropic-ai/sdk` bundles its agent-toolset (a server-side feature) which transitively imports `node:crypto`, `node:fs/promises`, `node:stream`, etc. The stubs are no-ops — the agent-toolset is never called at runtime.

### Social charge calculation

For all statuses (including SASU/EURL), charges are simplified as `totalRevenue × chargeRate`. This is a simulation, not exact legal accounting.

import { sendClaude } from './claudeService';
import { sendOpenAI } from './openaiService';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FinancialContext {
  status: string;
  totalRevenue: number;
  totalExpenses: number;
  socialCharges: number;
  netProfit: number;
  chargeRate: number;
}

export type Provider = 'claude' | 'openai';

export const MAX_HISTORY = 20;
export const REQUEST_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `Tu es ComptaExpert AI, un assistant expert en comptabilité française et gestion d'entreprise. Tu aides les entrepreneurs sur :
- Les charges sociales (taux URSSAF 2025, cotisations auto-entrepreneur, SASU, EURL)
- La fiscalité et optimisation fiscale
- La gestion de trésorerie, rentabilité et pilotage d'activité
- L'utilisation de l'application ComptaExpert (saisie de transactions, lecture des indicateurs, analyse IA)

Réponds en français, avec un ton professionnel, pédagogique et encourageant. Sois concis et utilise des exemples chiffrés si utile.`;

const buildSystem = (context?: FinancialContext): string =>
  context
    ? `${SYSTEM_PROMPT}\n\nSituation financière actuelle de l'utilisateur :\n- Statut : ${context.status}\n- CA : ${context.totalRevenue.toFixed(2)} €\n- Dépenses : ${context.totalExpenses.toFixed(2)} €\n- Charges sociales : ${context.socialCharges.toFixed(2)} €\n- Bénéfice net : ${context.netProfit.toFixed(2)} €\n- Taux de charges : ${(context.chargeRate * 100).toFixed(1)}%`
    : SYSTEM_PROMPT;

/** Fournisseur choisi via CHAT_PROVIDER dans .env.local ; Claude par défaut. */
export const getProvider = (): Provider =>
  process.env.CHAT_PROVIDER === 'openai' ? 'openai' : 'claude';

export const sendChatMessage = async (
  messages: ChatMessage[],
  context?: FinancialContext,
): Promise<string> => {
  const system = buildSystem(context);
  const history = messages.slice(-MAX_HISTORY);
  return getProvider() === 'openai'
    ? sendOpenAI(history, system)
    : sendClaude(history, system);
};

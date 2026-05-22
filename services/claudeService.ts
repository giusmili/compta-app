import Anthropic from '@anthropic-ai/sdk';

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

const SYSTEM_PROMPT = `Tu es ComptaExpert AI, un assistant expert en comptabilité française et gestion d'entreprise. Tu aides les entrepreneurs sur :
- Les charges sociales (taux URSSAF 2025, cotisations auto-entrepreneur, SASU, EURL)
- La fiscalité et optimisation fiscale
- La gestion de trésorerie, rentabilité et pilotage d'activité
- L'utilisation de l'application ComptaExpert (saisie de transactions, lecture des indicateurs, analyse IA)

Réponds en français, avec un ton professionnel, pédagogique et encourageant. Sois concis et utilise des exemples chiffrés si utile.`;

export const sendChatMessage = async (
  messages: ChatMessage[],
  context?: FinancialContext
): Promise<string> => {
  const client = new Anthropic({
    apiKey: process.env.API_KEY_CLAUDE,
    dangerouslyAllowBrowser: true,
  });

  const system = context
    ? `${SYSTEM_PROMPT}\n\nSituation financière actuelle de l'utilisateur :\n- Statut : ${context.status}\n- CA : ${context.totalRevenue.toFixed(2)} €\n- Dépenses : ${context.totalExpenses.toFixed(2)} €\n- Charges sociales : ${context.socialCharges.toFixed(2)} €\n- Bénéfice net : ${context.netProfit.toFixed(2)} €\n- Taux de charges : ${(context.chargeRate * 100).toFixed(1)}%`
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages,
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Type de réponse inattendu');
  return block.text;
};

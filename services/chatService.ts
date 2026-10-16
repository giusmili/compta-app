import type { ChatMessage, ChatRequestBody, FinancialContext } from '../shared/chat';

export type { ChatMessage, FinancialContext };

const TIMEOUT_MS = 35_000;

/** Appelle la fonction serveur /api/chat : aucune clé API n'est présente côté navigateur. */
export const sendChatMessage = async (
  messages: ChatMessage[],
  context?: FinancialContext,
): Promise<string> => {
  const body: ChatRequestBody = { messages, context };
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string };
  if (!response.ok || !data.reply) throw new Error(data.error ?? `HTTP ${response.status}`);
  return data.reply;
};

import type { ChatMessage } from './chatService';

const TIMEOUT_MS = 30_000;
const MODEL = 'gpt-4o-mini';

interface OpenAIResponse {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
}

// Appel direct à l'API REST (pas de SDK) pour ne pas alourdir le bundle.
export const sendOpenAI = async (messages: ChatMessage[], system: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) throw new Error(data.error?.message ?? `OpenAI HTTP ${response.status}`);

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Réponse OpenAI vide');
  return text;
};

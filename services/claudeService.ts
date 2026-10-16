import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from './chatService';

const TIMEOUT_MS = 30_000;

export const sendClaude = async (messages: ChatMessage[], system: string): Promise<string> => {
  const client = new Anthropic({
    apiKey: process.env.API_KEY_CLAUDE,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.messages.create(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    },
    { timeout: TIMEOUT_MS },
  );

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Type de réponse inattendu');
  return block.text;
};

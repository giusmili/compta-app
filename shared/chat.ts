// Types et limites partagés entre le front (services/chatService.ts) et la fonction serveur (api/chat.ts).

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

export interface ChatRequestBody {
  messages: ChatMessage[];
  context?: FinancialContext;
}

export const MAX_HISTORY = 20;
export const MAX_USER_CHARS = 1000;
export const MAX_ASSISTANT_CHARS = 8000;

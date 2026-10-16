import { BusinessStatus } from '../../types.js';
import type { ChatMessage, ChatRequestBody, FinancialContext } from '../../shared/chat.js';
import { MAX_ASSISTANT_CHARS, MAX_HISTORY, MAX_USER_CHARS } from '../../shared/chat.js';

const TIMEOUT_MS = 30_000;
const RATE_LIMIT = 20; // requêtes par IP et par minute (best-effort, en mémoire)
const rateBuckets = new Map<string, { count: number; reset: number }>();

const SYSTEM_PROMPT = `Tu es ComptaExpert AI, un assistant expert en comptabilité française et gestion d'entreprise. Tu aides les entrepreneurs sur :
- Les charges sociales (taux URSSAF 2025, cotisations auto-entrepreneur, SASU, EURL)
- La fiscalité et optimisation fiscale
- La gestion de trésorerie, rentabilité et pilotage d'activité
- L'utilisation de l'application ComptaExpert (saisie de transactions, lecture des indicateurs, analyse IA)

Réponds en français, avec un ton professionnel, pédagogique et encourageant. Sois concis et utilise des exemples chiffrés si utile.`;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.reset < now) {
    rateBuckets.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const parseContext = (raw: unknown): FinancialContext | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const c = raw as Record<string, unknown>;
  const status = Object.values(BusinessStatus).find(s => s === c.status);
  if (
    !status ||
    !isNum(c.totalRevenue) ||
    !isNum(c.totalExpenses) ||
    !isNum(c.socialCharges) ||
    !isNum(c.netProfit) ||
    !isNum(c.chargeRate)
  ) {
    return undefined;
  }
  return {
    status,
    totalRevenue: c.totalRevenue,
    totalExpenses: c.totalExpenses,
    socialCharges: c.socialCharges,
    netProfit: c.netProfit,
    chargeRate: c.chargeRate,
  };
};

const parseMessages = (raw: unknown): ChatMessage[] | null => {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_HISTORY) as unknown[]) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) return null;
    if (content.length > (role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)) return null;
    out.push({ role, content });
  }
  while (out.length && out[0].role !== 'user') out.shift(); // les API exigent un 1er message user
  return out.length && out[out.length - 1].role === 'user' ? out : null;
};

const buildSystem = (c?: FinancialContext): string =>
  c
    ? `${SYSTEM_PROMPT}\n\nSituation financière actuelle de l'utilisateur :\n- Statut : ${c.status}\n- CA : ${c.totalRevenue.toFixed(2)} €\n- Dépenses : ${c.totalExpenses.toFixed(2)} €\n- Charges sociales : ${c.socialCharges.toFixed(2)} €\n- Bénéfice net : ${c.netProfit.toFixed(2)} €\n- Taux de charges : ${(c.chargeRate * 100).toFixed(1)}%`
    : SYSTEM_PROMPT;

class UpstreamError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

const callOpenAI = async (messages: ChatMessage[], system: string, apiKey: string): Promise<string> => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = (await res.json()) as { choices?: { message?: { content?: string | null } }[]; error?: { message?: string } };
  if (!res.ok) throw new UpstreamError(res.status, `OpenAI ${res.status}: ${data.error?.message ?? 'erreur'}`);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Réponse OpenAI vide');
  return text;
};

export const handleChat = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  if (isRateLimited(ip)) return json({ error: 'Trop de requêtes, réessayez dans une minute.' }, 429);

  let body: Partial<ChatRequestBody>;
  try {
    body = (await req.json()) as Partial<ChatRequestBody>;
  } catch {
    return json({ error: 'Requête invalide' }, 400);
  }

  const messages = parseMessages(body.messages);
  if (!messages) return json({ error: 'Messages invalides' }, 400);
  const system = buildSystem(parseContext(body.context));

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error('OPENAI_API_KEY manquante');
    return json({ error: 'Service IA non configuré' }, 503);
  }

  try {
    const reply = await callOpenAI(messages, system, apiKey);
    return json({ reply });
  } catch (err) {
    console.error('Chat provider error:', err);
    const upstream = err instanceof UpstreamError ? err.status : undefined;
    return json({ error: 'Le service IA est indisponible', upstream }, 502);
  }
};

import { handleChat } from './_lib/handler';

// Fonction serverless Vercel : les clés API restent dans les variables d'environnement du projet.
export function POST(request: Request): Promise<Response> {
  return handleChat(request);
}

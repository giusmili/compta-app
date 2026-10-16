import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';

// En dev, sert /api/chat avec le même handler que la fonction Vercel.
// Les variables de .env.local sont lues côté serveur uniquement : elles ne sont jamais injectées dans le bundle.
const devApi = (env: Record<string, string>): Plugin => ({
  name: 'dev-api-chat',
  apply: 'serve',
  configureServer(server) {
    Object.assign(process.env, env);
    server.middlewares.use('/api/chat', (req, res) => {
      void (async () => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const { handleChat } = (await server.ssrLoadModule('/api/_lib/handler.ts')) as typeof import('./api/_lib/handler');
        const request = new Request('http://localhost/api/chat', {
          method: req.method,
          headers: { 'Content-Type': 'application/json' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const response = await handleChat(request);
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(await response.text());
      })().catch((err: unknown) => {
        console.error(err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Erreur serveur de développement' }));
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), devApi(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});

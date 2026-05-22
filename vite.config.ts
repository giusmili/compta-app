import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

// Stub Node.js built-ins imported by @anthropic-ai/sdk's agent-toolset (server-only, not used in browser)
const stubNodeBuiltins: Plugin = {
  name: 'stub-node-builtins',
  enforce: 'pre',
  resolveId(source) {
    if (source.startsWith('node:')) return source;
  },
  load(id) {
    if (!id.startsWith('node:')) return;
    const noop = `() => {}`;
    const rejectFn = `() => Promise.reject(new Error('Not available in browser'))`;
    if (id === 'node:crypto') {
      return `export const randomUUID = () => crypto.randomUUID(); export default { randomUUID };`;
    }
    if (id === 'node:path') {
      return `export const join = (...a) => a.join('/');
export const resolve = (...a) => a.join('/');
export const dirname = (p) => p.split('/').slice(0,-1).join('/');
export const basename = (p) => p.split('/').pop();
export const sep = '/';
export default { join, resolve, dirname, basename, sep };`;
    }
    if (id === 'node:fs/promises') {
      return `export const readFile = ${rejectFn}; export const writeFile = ${rejectFn};
export const mkdir = ${rejectFn}; export const readdir = ${rejectFn};
export const stat = ${rejectFn}; export const rm = ${rejectFn};
export const access = ${rejectFn}; export const rename = ${rejectFn};
export default { readFile, writeFile, mkdir, readdir, stat, rm, access, rename };`;
    }
    if (id === 'node:fs') {
      return `export const existsSync = () => false; export const mkdirSync = ${noop};
export const writeFileSync = ${noop}; export const readFileSync = ${noop};
export const createWriteStream = () => ({}); export const createReadStream = () => ({});
export default { existsSync, mkdirSync, writeFileSync, readFileSync, createWriteStream, createReadStream };`;
    }
    if (id === 'node:child_process') {
      return `export const execFile = ${noop}; export const exec = ${noop};
export const spawn = () => ({}); export default { execFile, exec, spawn };`;
    }
    if (id === 'node:util') {
      return `export const promisify = (fn) => fn; export const inspect = (v) => String(v);
export default { promisify, inspect };`;
    }
    if (id === 'node:stream') {
      return `export class Readable { static from() { return new Readable(); } }
export class Writable {} export class Transform {}
export default { Readable, Writable, Transform };`;
    }
    if (id === 'node:stream/promises') {
      return `export const pipeline = ${rejectFn}; export default { pipeline };`;
    }
    return `export default {};`;
  },
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [stubNodeBuiltins, react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.API_KEY_CLAUDE': JSON.stringify(env.API_KEY_CLAUDE),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

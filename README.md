
# ComptaExpert 

Application pour aider les entrepreneurs à vérifier et suivre leur comptabilité avec des analyses assistées par IA.

## Démarrer en local

**Pré-requis :** Node.js

1. Installer les dépendances : `npm install`
2. Renseigner `API_KEY` dans [.env.local](.env.local)
3. Lancer l'appli : `npm run dev`

## Notes techniques

- Frontend React + Vite en TypeScript, structure single-page.
- Visualisation via Recharts (graphiques et jauges pour la santé financière).
- Appels IA avec `@google/genai` (Gemini) pour analyser les données comptables.
- Configuration Vite par défaut, build esbuild ; ajouter un `index.css` global si besoin de styles communs.

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-67B7D1?logo=apacheecharts&logoColor=white)

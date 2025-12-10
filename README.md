# psycology-ai — Local setup & server proxy for Gemini (Generative AI)

This repository is a small Vue 3 + Vite app with a cozy UI and a lightweight server-side proxy that forwards prompts to Google's Generative Language API (Gemini). The proxy keeps your API key off the browser.

Important: do NOT commit real API keys to version control. Keep `.env` local and secret.

---

## Quick overview

- Frontend: Vue 3 + Vite. The AI chat widget is in `src/components/AiTutor.vue`. The frontend calls a local proxy at `POST /api/generate`.
- Backend proxy: simple Express server at `server/index.js` which forwards requests to the Generative Language REST endpoint.
- Styling: Tailwind config contains a `cozy` color palette and adjusted shadows for a "cozy" look.

---

## Environment (.env)

Create a `.env` file in the project root with your API key. Example (one line):

`GENAI_API_KEY=your_real_api_key_here`

Notes:
- This project looks for `GENAI_API_KEY` (or `VITE_GEMINI_API_KEY`) in `server/index.js`.
- Never share the `.env` contents in public repositories or chats.

---

## Install dependencies

1. Install node modules:

`npm install`

This will install both frontend and backend dependencies (the `package.json` in this repo includes `express`, `dotenv`, `cors`, Vue packages, and Tailwind-related dev deps).

---

## Run locally

1. Start the frontend dev server (Vite):

`npm run dev`

2. In a second terminal, start the backend proxy:

`npm run start:server`

- The backend listens on `PORT` (default `3000`) and exposes:
  - `GET /api/health` — quick health check, returns `{ status: "ok", env: true|false }`.
  - `POST /api/generate` — accepts JSON `{ prompt: string, model?: string, temperature?: number, maxOutputTokens?: number }`.

---

## API usage (proxy)

- Endpoint: `POST /api/generate`
- Payload: JSON
  - Required: `prompt` (string)
  - Optional: `model` (default `models/gemini-1.5-flash`), `temperature`, `maxOutputTokens`
- Response: JSON
  - `outputText` (string) — main text returned by the model
  - `raw` — full raw response from the Generative API (for debugging)

Example request shape (frontend sends this automatically from `AiTutor.vue`):

`{ "prompt": "Your composed prompt here..." }`

If the proxy cannot reach the external API or the key is missing/invalid, it will return a 4xx/5xx with `error` and optional `details`.

---

## Frontend notes

- `src/components/AiTutor.vue` was updated to call `/api/generate` instead of initializing Gemini directly in the browser. This prevents exposing secrets to users.
- The prompt sent includes:
  - `contextData` (from `src/data/aiContext.js`)
  - Recent chat history (last ~6 messages)
  - A short instruction for tone/format (cute/affectionate, use emoji)
- UI class names use Tailwind with the `cozy` palette from `tailwind.config.js` (fonts: Nunito/Quicksand).

---

## Design / "cozy" improvements

- Colors: `cozy.bg`, `cozy.card`, `cozy.primary`, `cozy.secondary`, `cozy.accent`.
- Shadows: softer, layered shadows to feel warm and pillowy.
- Components updated to use larger radii and gentle gradients (see `AiTutor.vue`, `HeaderSection.vue`, and `tailwind.config.js`).

If you want more design changes (e.g., different fonts, spacing, or animations), tell me which components to tweak and the specific feel you want (e.g., "softer", "more playful", "minimal").

---

## Security & production considerations

- Never put API keys in client-side code or files that may be served to users.
- For production hosting:
  - Use environment variable management provided by your host (do NOT commit `.env`).
  - Add CORS restrictions on the Express server to only allow trusted origins.
  - Consider rate limits and monitoring for the proxy to prevent abuse.
  - Rotate keys if they were ever exposed.
- The Express proxy currently uses REST calls to the Generative Language endpoint and a simple extraction strategy to return text. For a robust production integration, validate and sanitize prompts, parse structured responses, and add logging and error tracking.

---

## Troubleshooting

- "Server returns 500 / missing API key": verify `.env` contains `GENAI_API_KEY` and restart the server.
- "Frontend cannot reach `/api/generate`": ensure the proxy is running and no CORS/network restrictions are blocking requests. When running frontend via Vite and backend on another port, in development you may need to configure a Vite proxy or run both sites on the same origin. The included code assumes frontend can call `http://localhost:3000/api/generate` (if you use different ports, adjust fetch URLs or configure a Vite proxy).
- "Model returns weird JSON": check the `raw` field in the response to see the full API output; update server parsing rules if Google changes response shapes.

---

## Where to look in the repo

- Frontend chat widget: `src/components/AiTutor.vue`
- Server proxy: `server/index.js`
- Tailwind theme & cozy palette: `tailwind.config.js`
- Prompt/context data: `src/data/aiContext.js`
- App entry: `src/main.js` and `index.html`

---

If you want, I can:
- Add a `script` that runs both `dev` and the server together (e.g., using `concurrently`).
- Harden the proxy (rate limits, authentication).
- Further polish the cozy design (icons, subtle micro-interactions).
Tell me which next step you prefer.
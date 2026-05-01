# kooler-widget — routing map

Last updated: 2026-05-01

## Purpose

Embeddable customer chat widget for Kooler Garage Doors. React 19 + Vite + TypeScript. Loads as a script tag on koolergaragedoors.com, opens a Weggy chat session, streams responses from `kooler-inbound-server`.

Per [[doctrine_weggy_modes]]: this is the **Outward**-mode presentation surface. The brain runs server-side; the widget is presentation.

## Brain

**None.** This repo is presentation-only — no inference. All AI happens in `kooler-inbound-server` (OpenAI GPT-4o + Pinecone RAG). The widget just opens an SSE stream and renders chunks.

## Where stuff lives

| Concern | Location |
|---|---|
| Vite entry HTML | `index.html` |
| App entry | `src/main.tsx` |
| Top-level component | `src/App.tsx` |
| UI components | `src/components/` |
| Embed loader (script-tag injection) | `src/loader/` |
| API client + SSE parsing | `src/services/` |
| React hooks | `src/hooks/` |
| Type definitions | `src/types/` |
| Build config (Vite + TS) | `vite.config.ts`, `tsconfig*.json` |
| Demo page | `demo/` |
| Public static assets | `public/` |
| Design plans | `docs/plans/` (e.g. NEUMORPHIC_REDESIGN_PLAN.md) |

## Deploy

- **Vercel team `kooler`.** Deploy config lives Vercel-side (no `vercel.json` in repo).
- Auth: `vercel switch kooler` before any deploy command.
- Env vars: Vercel-managed (no Doppler integration on Vercel side).

## Run locally

```bash
cd ~/code/kooler-widget
npm run dev      # vite dev server
npm run build    # vite build
npm run preview  # vite preview after build
npm run lint
```

## Hard rails (Outward presentation)

1. **No emojis** in any customer-facing copy (system prompts in the server, response renderers, error messages, button labels, placeholder text, brand assets).
2. **Brand voice is Sharp, Caring, In Command** — but voice happens server-side. The widget doesn't fabricate copy; it renders what the backend streams.
3. **No customer PII in client-side logs.** Layer 3 stays server-side.
4. **No Anthropic SDK / OpenAI SDK on the client.** Inference is server-only.

## Avatar modulation (soul.md §4)

Voice gear shifts by audience persona — Barb (concierge), Dave & Diana (busy family), Jack & Jill (luxury), Heather & Chase (tech-forward). All inherit the canonical voice; the widget renders whatever the server sends.

## Branding (per KOOLER-PRD §)

- Color scheme placeholder: navy `#1B2F5B` / orange `#F97316` (TBD by client; check with Matt before final).
- Weggy avatar lives in `public/` (verify current version in `Weggy REPOS/Weggy-Widget/` snapshot for reference).

## Related

- Backend: `~/code/kooler-inbound-server/` (where the brain lives)
- Voice cousin: `~/code/weggy-v2-backend/`
- Operator dashboard: `~/code/kooler-ops-dashboard/`
- Widget PRD: `/Users/weggy/Desktop/KOOLER WEGGY 2.0/DOCS/KOOLER-WIDGET-PRD.md` (25 KB)
- Memory layer: `~/.weggy-memory/CLAUDE.md`
- SOUL DOC: `/Users/weggy/Desktop/KOOLER WEGGY 2.0/soul.md`

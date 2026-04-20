# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server with HMR
npm run build        # vue-tsc type-check + Vite production build → dist/
npm run preview      # Local preview of production build
npm run prob:simulate  # Run probability simulation script
npm run vectors:sync   # Sync character vector data
```

No lint or test commands are configured.

## Architecture

ARKTI is a fully client-side Vue 3 + TypeScript SPA — an MBTI-style personality quiz for Arknights players. No backend, no database, no authentication. Results are stored in `localStorage` under `arkti:last-result`. Deployed as a static site to Cloudflare Pages.

**User flow:** Home → Intro → Quiz (30 random questions from a 39-question bank) → Result (matched character + archetype) → Share (PNG export via `html-to-image`)

### Scoring Engine (`src/utils/quizEngine.ts`)

This is the intellectual core of the app. The algorithm is weighted across four components:

| Component | Weight | Description |
|-----------|--------|-------------|
| MBTI | 58% | Classic 4-axis scoring (E/I, S/N, T/F, J/P) |
| Archetype | 12% | Maps to 8 anime archetypes |
| Vector | 24% | 6-axis character vector (`expression`, `temperature`, `judgement`, `order`, `agency`, `aura`) |
| Character-specific | 6% | Signature question scores per character |

Archetype scoring applies "gamma blending" to compress midrange results. A population probability prior (`characterProbabilities.json`) is applied to the final match for realistic distribution. Matching is deterministic — same answers always yield the same character.

### State Management

Quiz session state lives in `src/composables/useQuiz.ts` using Vue 3 `reactive()` and `computed()`. There is no Vuex/Pinia. Share logic is in `src/composables/useShare.ts`.

### Data Layer

All content is static JSON in `src/data/`:
- `questions.json` — 39-question bank with per-axis weights
- `characters.json` — 32 characters with MBTI, archetype, and 6-axis vectors
- `archetypes.json` — 8 archetype definitions
- `characterVisuals.json` — Visual config merged at runtime via `hydrateCharacterVisual()`
- `characterProbabilities.json` — Population priors for result distribution

### i18n

Custom localization (not vue-i18n). All strings are in `src/i18n/messages.ts` (~117KB) supporting Simplified Chinese, Traditional Chinese, English, and Japanese. Selected locale is persisted to localStorage.

### Routing

Hash-based (`createWebHashHistory`) with 6 lazy-loaded routes defined in `src/router/index.ts`. Hash routing is required for static hosting compatibility.

### UI Conventions

- `src/pages/` — Full-page route components
- `src/components/` — Reusable stateless fragments
- `v-reveal` — Custom global directive using Intersection Observer for scroll-triggered fade-in animations
- All styling is in `src/style.css` (~35KB custom CSS, no Tailwind)

## CI / Deployment

GitHub Actions runs `npm ci && npm run build` on every push to `main` and all PRs (Node 22). Tagged releases (`v*`) build and zip `dist/` for GitHub Release. `vite.config.ts` sets `base: './'` for relative-path static hosting on Cloudflare Pages.

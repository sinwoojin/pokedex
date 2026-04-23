# agent.md

## Project Overview
- This repository is a Pokémon-focused community product built around a Korean-language UX tone.
- The frontend is a Next.js App Router app in the repo root.
- The backend is a separate service in `api/`, designed for NestJS-style Oracle-backed community APIs.
- The product tone is not generic Pokédex copy; it uses a community/editorial framing like "포챔스", "메타", "카운터", and "실전 후기".

## Core Product Rules
- Preserve the Pokémon-specific product voice. UI copy should feel like a Korean Pokémon community, not a generic CRUD dashboard.
- Prefer Pokémon-aware naming, labels, examples, and sample data when adding UI or content.
- Keep Korean user-facing copy consistent with the existing style in `README.md`, `components/pokedex-header.tsx`, and `components/community-feed.tsx`.
- When there is a choice between a generic UI concept and a Pokémon-community concept, prefer the Pokémon-community concept if it improves coherence.

## Architecture Boundaries

### Frontend (repo root)
- The root app uses:
  - Next.js App Router
  - React 19
  - TypeScript strict mode
  - Zustand for app/client state
  - React Query for async Pokémon fetching
  - Jest + Testing Library for tests
- Keep frontend imports on the `@/*` alias pattern from root `tsconfig.json`.
- Do not place backend runtime code inside the root app.
- Do not make the root app depend on `api/` source files directly.

### Backend (`api/`)
- The backend is a separate TypeScript service with its own `package.json` and `tsconfig.json`.
- Treat `api/` as an independent service boundary.
- Oracle access belongs in `api/`, not in frontend components, hooks, or Zustand store logic.
- Prefer repository/service/controller separation for backend changes.

## Data Flow Rules
- Frontend community UI currently supports two modes:
  1. Local fallback mode using Zustand
  2. Remote API mode when `NEXT_PUBLIC_COMMUNITY_API_BASE_URL` is set
- Preserve that fallback behavior unless the task explicitly removes it.
- For Pokémon browse/search data, follow the existing pattern:
  - domain fetch logic in `lib/`
  - query orchestration in hooks like `hooks/use-card-grid-data.ts`
  - client state in Zustand only when it is truly app state
- Avoid pushing network logic deep into presentational components unless that file already acts as a smart client container, like `components/community-feed.tsx`.

## Code Style Rules
- Maintain strict TypeScript compatibility. Do not use `any`, `@ts-ignore`, or unsafe type suppression.
- Match the repo’s current style:
  - small focused helpers
  - descriptive naming
  - minimal abstractions unless repetition justifies extraction
  - functional React components with hooks
- Keep code readable over clever.
- Prefer explicit domain names like `communityPosts`, `relatedPokemon`, `sortOrder`, `weaknesses`, `evolutionStages`.

## Frontend Implementation Rules
- User-facing text should stay in Korean unless there is an established English label already used as a section marker.
- Preserve accessibility hooks used in tests, such as labels, button names, and visible text.
- If you change interactions in `components/community-feed.tsx`, `components/pokedex-header.tsx`, or `components/pokemon-card-grid.tsx`, review related tests immediately.
- Reuse existing CSS class naming patterns in `app/globals.css` instead of inventing unrelated naming systems.

## Backend Implementation Rules
- Use a single Oracle connection pool owned by the backend service layer.
- Do not create per-request Oracle pools.
- Keep Oracle SQL in repository-layer files, not controllers.
- Validate request payloads with DTOs and class-validator.
- Expose health-check behavior through dedicated endpoints like `api/src/health/health.controller.ts`.
- Keep environment parsing centralized in config files such as `api/src/config/env.ts`.

## Database and Infra Rules
- Oracle schema/init scripts live in `api/db/`.
- Local stack orchestration lives in `docker-compose.dev.yml`.
- If changing the local stack, make sure `web`, `api`, and `oracle` service assumptions remain aligned.
- Keep `.env.example` and `api/.env.example` up to date whenever environment variables change.
- Prefer Thin-mode-friendly Oracle setup unless a task explicitly requires Thick mode.

## Testing and Verification

### Frontend checks
- Run these after meaningful frontend changes:
  - `npm run lint`
  - `npm run test:ci`
  - `npm run build`

### Backend checks
- Run these after meaningful backend changes:
  - `npm --prefix ./api run lint`
  - `npm --prefix ./api run build`

### Full local stack
- Use `npm run dev:stack` for the compose-based local stack.
- Use `docker compose -f docker-compose.dev.yml config` to validate compose changes quickly.

## File Placement Rules
- Frontend feature/UI logic: `components/`, `hooks/`, `providers/`, `stores/`, `lib/`
- Frontend tests: `__tests__/`
- Backend runtime code: `api/src/`
- DB bootstrap assets: `api/db/`
- Do not put backend files under the root app tree.
- Do not put frontend tests inside `api/`.

## Existing Tooling Constraints
- Root ESLint/Jest/TypeScript configs intentionally exclude `api/`.
- Do not undo that split unless you are deliberately unifying the toolchain.
- If you add backend dependencies, add them in `api/package.json`, not the root `package.json`.
- If you add frontend dependencies, add them in the root `package.json`, not `api/package.json`.

## Change Management Rules
- Keep diffs surgical.
- Match existing patterns before introducing new ones.
- When changing store behavior, preserve persisted-state expectations unless migration is intentional.
- When changing API contracts, update both frontend callers and backend DTO/controller/repository flow together.
- When changing user-facing behavior, update or add tests that prove the new behavior.

## Git / Commit Conventions
- If asked to create branches or commits, use the project’s requested format:
  - Branch: `feat():작업행동`
  - Commits: `feat():작업행동`, `fix():수정내용`, `chore():수정내용`, `docs():문서내용`, `refactor():리팩터링내용`
- Keep commit messages concise and action-oriented.

## Agent Behavior Rules
- Read the relevant files first; do not guess.
- Respect the frontend/backend boundary.
- Preserve local fallback behavior unless explicitly replacing it.
- Preserve Korean Pokémon-community product tone.
- Verify with the appropriate frontend/backend commands before declaring work complete.

# StackLens Copilot instructions

## Project overview

This repo is a client-side React + TypeScript app that parses raw stack traces and renders a cleaned, interactive call tree in the browser. It is intentionally offline-first and does not use a backend or remote API. The main functionality is split between:

- `src/App.tsx`: app state, language detection, parser selection, and UI orchestration.
- `src/parsers/`: language-specific stack-trace parsers and detection heuristics.
- `src/components/`: React UI for headers, filters, frames, and exception banners.
- `src/lib/`: shared helpers for formatting, folding, scrubbing, and persisted state.
- `src/samples.ts`: built-in sample traces used by the app.

Treat the app as a browser-only parser/visualizer, not a full-stack service.

## Commands

Use the repo scripts from `package.json`:

- `npm run dev` — start Vite dev server.
- `npm test` — run the Vitest suite (`vitest run`).
- `npm run build` — typecheck with `tsc -b` and produce a production build in `dist/`.
- `npm run icons` — regenerate the PWA icons from the SVG in `scripts/`.

For a single test file, run:

- `npx vitest run src/parsers/javascript.test.ts`
- or `npx vitest run -t "parses V8 frames" src/parsers/javascript.test.ts`

For a focused parser check during development, prefer a single test file or a single `-t` filter instead of the full suite.

## Architecture and conventions

### Parsing model

- `src/parsers/types.ts` defines the shared types (`Language`, `StackFrame`, `ParsedException`, `ParsedStackTrace`).
- `src/parsers/detect.ts` uses heuristic regex scoring to infer the language from the raw trace.
- `src/parsers/index.ts` orchestrates parser selection and exposes `detectLanguage()` and `parseStackTrace()`.
- Each parser (`csharp`, `python`, `javascript`, `java`, `rust`) is a pure function that accepts a raw string and returns a structured parse tree.

Keep new parser work pure and deterministic. Favor small, regex-driven extraction + normalization functions over large ad hoc transforms.

### UI/model boundaries

- UI state in `src/App.tsx` should remain thin; it coordinates persistence, active exception selection, search, and filters.
- The parser output is consumed by `src/components/FrameList`, `ExceptionBanner`, and other UI components; they should not re-parse raw text.
- Shared behavior like `toMarkdown`, `scrubTrace`, `foldFrames`, and `usePersistedState` belongs in `src/lib/`.

Do not add backend dependencies or move parsing into a server. The app is designed to run entirely client-side.

### Testing

- Vitest tests live next to the code they validate, e.g. `src/parsers/javascript.test.ts`.
- Prefer adding/adjusting parser tests when changing supported stack trace formats.
- Tests should validate the actual parsed output shape and key flags such as `isFramework`, `isAsync`, `className`, `method`, `file`, and `line`.

### Deployment and base paths

This project supports sub-path deployment (for example GitHub Pages):

- `BASE_PATH=/stack-lens/ npm run build`
- The Vite config, PWA manifest, and start URL all respect `BASE_PATH`.

When changing routing or deployment-related config, keep `BASE_PATH` compatibility in mind.

### Styling and implementation notes

- The app uses React + Vite + Tailwind via `@tailwindcss/vite`.
- The project is installable as a PWA; keep manifest changes consistent with `vite.config.ts`.
- Most end-user features revolve around reducing noise from framework/runtime frames while preserving the relevant app frames.

## Repo-specific work patterns

- Preserve the existing parser/visualizer separation. If changing a trace format, update the matching parser and its tests together.
- When you add new trace signature support, prefer local heuristics that improve `detectLanguage()` or parser extraction for that format rather than broad changes to unrelated code.
- Keep changes small and evidence-based; validate with the smallest relevant Vitest command rather than running the whole suite for every change.
- Follow the existing TypeScript style and explicit typing patterns in `src/parsers/types.ts` and the surrounding modules.

## What not to do

- Do not introduce a backend or network dependency for parsing.
- Do not treat this as a generic app template; the core value is parsing stack traces from multiple runtimes.
- Do not broaden the scope with unrelated framework choices or build systems.
- Do not remove or weaken the app’s offline / PWA behavior unless the task explicitly requires it.

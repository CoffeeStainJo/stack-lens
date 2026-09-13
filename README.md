# StackLens

Paste a raw stack trace, get an interactive, syntax-highlighted call tree with framework noise folded away and one-click links into VS Code. Everything runs in the browser; nothing is sent to a server. Installable as a PWA.

Supported: C# / .NET (inner exception chains, async demangling), Python (chained exceptions, source snippets), TypeScript / JavaScript (V8, Chrome, Firefox), Java / JVM (Caused by chains), Rust (panics with backtraces).

## Scripts

    npm run dev      # start the dev server
    npm test         # run vitest parser tests
    npm run build    # typecheck + production build (dist/)
    npm run icons    # regenerate PWA icons from the SVG in scripts/

## Deploying under a sub-path (GitHub Pages)

    BASE_PATH=/stack-lens/ npm run build

The Vite `base`, PWA `start_url` and `scope` all follow `BASE_PATH`.

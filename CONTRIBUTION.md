# Contributing to FitTrackr-AI

Thank you for your interest in contributing to FitTrackr-AI! Whether you're fixing a bug, adding a feature, improving docs, or writing tests — every contribution is welcome and appreciated.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Branching & Commit Conventions](#branching--commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [AI / Claude Integration Notes](#ai--claude-integration-notes)

---

## Code of Conduct

By participating in this project you agree to be respectful and constructive in all interactions. Harassment, discrimination, or hostile behavior of any kind will not be tolerated.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Fittrackr-Ai.git
   cd Fittrackr-Ai
   ```
3. Add the upstream remote so you can stay in sync:
   ```bash
   git remote add upstream https://github.com/Banti4750/Fittrackr-Ai.git
   ```

---

## Project Structure

```
Fittrackr-Ai/
├── fittrackr-backend/     Node.js · Express · MongoDB · Mongoose · JWT
└── fittrackr-app/         Expo (React Native) · TypeScript · Zustand · React Query
```

Keep backend and frontend changes in separate commits where possible — it makes review much easier.

---

## Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| MongoDB | local or Atlas URI |
| Expo CLI | `npm i -g expo` |
| Anthropic API key | optional (falls back to local analysis) |
| Cloudinary account | optional (required for photo uploads only) |

### Backend

```bash
cd fittrackr-backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, and optionally CLAUDE_API_KEY / OPENAI_API_KEY

npm install
npm run seed      # seeds ~85 exercises
npm run dev       # http://localhost:5000
```

Verify with: `GET http://localhost:5000/health` → `{ ok: true }`

### Frontend

```bash
cd fittrackr-app
cp .env.example .env
# Set EXPO_PUBLIC_API_URL (use your LAN IP when testing on a physical device)

npm install
npx expo start
```

Scan the QR code with Expo Go, or use an iOS Simulator / Android emulator.

---

## How to Contribute

### Bug Fixes

1. Check [open issues](https://github.com/Banti4750/Fittrackr-Ai/issues) first — the bug may already be tracked.
2. Open an issue describing the bug if one doesn't exist.
3. Create a branch, fix it, add a test if applicable, and open a PR.

### New Features

1. Open a **Feature Request** issue to discuss the idea before writing any code. This saves everyone time if the direction needs adjustment.
2. Once the approach is agreed upon, create a branch and implement it.
3. Update relevant documentation (`README.md`, inline comments, or this file) as needed.

### Documentation

Improvements to the README, inline code comments, API reference, or this file are always welcome — no issue required for small fixes.

---

## Branching & Commit Conventions

### Branch names

```
feature/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
```

Examples: `feature/rest-timer-sound`, `fix/pr-detection-edge-case`, `docs/setup-guide`

### Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec:

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure without behaviour change |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, CI |

Examples:
```
feat(backend): add muscle-breakdown endpoint
fix(app): correct streak count off-by-one error
docs: update env variable table in README
```

---

## Pull Request Process

1. **Sync with upstream** before opening a PR:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Describe your PR** clearly: what changed, why, and how to test it.
3. **Link related issues** using `Closes #<issue-number>` in the PR description.
4. **Keep PRs focused** — one logical change per PR. Large PRs are harder to review and slower to merge.
5. A maintainer will review your PR and may request changes. Please respond to feedback promptly.
6. Once approved, the maintainer will merge it. Don't merge your own PR without approval.

---

## Coding Standards

### Backend (Node.js / Express)

- Use `async/await`; avoid callback-style patterns.
- Validate all incoming request bodies before processing.
- Return consistent JSON shapes: `{ data }` for success, `{ error, message }` for failures.
- All new API routes must be documented in the API reference table in `README.md`.
- Keep route handlers thin — business logic belongs in service/utility modules.

### Frontend (React Native / Expo / TypeScript)

- Use **TypeScript** for all new files; avoid `any` types.
- Keep components small and focused on a single responsibility.
- Use **Zustand** stores (`useAuthStore`, `useWorkoutStore`, `useUIStore`) for global state; local state for ephemeral UI.
- Fetch data via **React Query** — don't add raw `useEffect` data-fetching hooks.
- Respect the existing light/dark theme via `useTheme()` hook; never hardcode colours.
- Add JSDoc comments to non-obvious utility functions.

---

## Testing

The project currently relies on manual testing via the Expo Go happy path described in the README. Automated tests are a great area to contribute!

When adding tests:

- **Backend** — place test files alongside source files as `*.test.js` or in a top-level `__tests__/` directory. Use Jest.
- **Frontend** — use React Native Testing Library. Place component tests adjacent to the component file.

Run existing tests (once present) before opening a PR:
```bash
# backend
cd fittrackr-backend && npm test

# app
cd fittrackr-app && npm test
```

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/Banti4750/Fittrackr-Ai/issues/new) and include:

- **Environment** — OS, Node version, Expo SDK version, device/emulator.
- **Steps to reproduce** — be as specific as possible.
- **Expected behaviour** — what should have happened.
- **Actual behaviour** — what did happen (include any error messages or stack traces).
- **Screenshots or logs** — if applicable.

---

## Suggesting Features

Open a [GitHub Issue](https://github.com/Banti4750/Fittrackr-Ai/issues/new) with the label `enhancement` and include:

- The problem you're trying to solve.
- Your proposed solution or approach.
- Any alternatives you've considered.

---

## AI / Claude Integration Notes

FitTrackr-AI uses the Anthropic Claude API (or OpenAI as a fallback) for workout insights.

If you're working on the AI layer (`fittrackr-backend/src/ai/` or the `/api/ai` routes), please keep these principles in mind:

- **Structured prompts only** — the backend sends a structured JSON payload to Claude; avoid free-form or unpredictable prompt shapes.
- **Always handle the fallback** — `POST /api/ai/insights` must return a valid response even when both `CLAUDE_API_KEY` and `OPENAI_API_KEY` are absent. The deterministic local fallback must never be broken.
- **Cache results** — AI calls are cached as `AIInsight` documents with a 24-hour TTL. Don't bypass the cache in normal flows; this keeps costs predictable.
- **No API keys in code** — keys are loaded from environment variables only. Never hardcode or log them.
- **Test without a key** — all AI-related PRs should be verifiable without a live API key using the local fallback path.

---

## Questions?

If you're unsure about anything, open a [Discussion](https://github.com/Banti4750/Fittrackr-Ai/discussions) or comment on a related issue. We're happy to help you get started.

Happy coding! 💪
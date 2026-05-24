# Contributing to FitTrackr

Thanks for your interest in contributing! This guide gets you from a fresh clone to a running local stack and a clean pull request. If anything here is unclear or out of date, please open an issue — improving these docs is a valid contribution too.

## Table of contents

- [Repo layout](#repo-layout)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
  - [1. Clone](#1-clone)
  - [2. Backend](#2-backend)
  - [3. App](#3-app)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Coding conventions](#coding-conventions)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Reporting bugs & requesting features](#reporting-bugs--requesting-features)

---

## Repo layout

This is a monorepo with two independent npm packages:

```
fittrackr-backend/   Node.js + Express + MongoDB (Mongoose) + JWT REST API (TypeScript)
fittrackr-app/       Expo (React Native) + TypeScript + Zustand + React Query client
.github/workflows/   CI (typecheck + build) and EAS update pipelines
```

Each package has its own `package.json`, `.env`, and `node_modules`. There is no root-level workspace — install dependencies in each directory separately.

## Prerequisites

- **Node 20+** (CI runs on Node 20; Node 18 also works locally)
- **MongoDB** running locally, or a MongoDB Atlas connection string
- **Git**
- For the app: the **Expo Go** mobile app, or an iOS Simulator / Android emulator
- *(Optional)* An AI provider key — Gemini, Claude, or OpenAI — to exercise the AI insights endpoint
- *(Optional)* A Cloudinary account for photo uploads

## Local setup

### 1. Clone

```bash
git clone https://github.com/Banti4750/Fittrackr-Ai.git
cd "Fittrackr Ai"
```

### 2. Backend

```bash
cd fittrackr-backend
cp .env.example .env          # on Windows PowerShell: copy .env.example .env
# Edit .env — at minimum set MONGODB_URI and JWT_SECRET.
# AI keys and Cloudinary keys are optional; the app degrades gracefully without them.

npm install
npm run seed                  # populate ~85 exercises (run once)
npm run dev                   # tsx watch — restarts on change, serves http://localhost:5000
```

`fittrackr-backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fittrackr
JWT_SECRET=replace-me-with-a-long-random-secret
JWT_EXPIRES_IN=30d

# AI provider — set one or more. Priority: Gemini → Claude → OpenAI.
CLAUDE_API_KEY=
CLAUDE_MODEL=claude-sonnet-4-20250514
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Verify it's up: `GET http://localhost:5000/health` returns `{ "ok": true }`.

Other backend scripts:

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start with hot reload (`tsx watch`)   |
| `npm run build`     | Compile TypeScript to `dist/`         |
| `npm start`         | Run the compiled build                |
| `npm run seed`      | Seed the exercise library             |
| `npm run typecheck` | Type-check without emitting           |

### 3. App

```bash
cd fittrackr-app
cp .env.example .env          # on Windows PowerShell: copy .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL.
#   Simulator/emulator: http://localhost:5000/api
#   Physical device:    http://<your-LAN-IP>:5000/api   (localhost won't reach your machine)

npm install --legacy-peer-deps   # required — see note below
npx expo start
```

`fittrackr-app/.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

Then open the app in Expo Go (scan the QR code), an iOS Simulator, or an Android emulator.

> **Why `--legacy-peer-deps`?** Expo SDK 54 pins `react@19.1.0` while a transitive
> `react-dom` asks for `^19.2.6`. The lockfile was generated with this flag, and CI
> uses it too — installing without it can fail or drift the lockfile.

## Project structure

**Backend** (`fittrackr-backend/src/`):

```
app.ts            Express app: middleware + route mounting
server.ts         Boots the app and connects to Mongo
config/           db connection, env parsing
models/           Mongoose schemas (User, Exercise, WorkoutSession, ...)
controllers/      Request handlers, one per resource
routes/           Express routers, mounted under /api/* in app.ts
middleware/        auth (JWT), error handling
services/         AI provider calls, streaks, Cloudinary, starter templates
seed/             Exercise seed data + seed script
utils/            Shared helpers
```

**App** (`fittrackr-app/`): file-based routing via `expo-router` under `app/`, with shared code in `src/` (`api/`, `components/`, `stores/`, `theme/`, `utils/`, `types/`). See the **Architecture** and **State** sections in [README.md](README.md) for the full map.

## Development workflow

1. Make sure your `main` is current: `git pull origin main`.
2. Branch off `main`:

   ```bash
   git checkout -b feat/short-description     # or fix/, docs/, chore/, refactor/
   ```

3. Make your change. Keep edits focused — one logical change per PR.
4. **Type-check before you push.** CI runs the same checks on every PR:

   ```bash
   cd fittrackr-backend && npm run typecheck && npm run build
   cd ../fittrackr-app   && npm run typecheck
   ```

5. Test the relevant flow manually (see "Try the happy path" in [README.md](README.md)).
6. Commit, push, and open a pull request.

## Coding conventions

- **TypeScript everywhere** — avoid `any`; prefer the shared types in `src/types/` (app) and the Mongoose model types (backend).
- **Match the surrounding style.** Follow the patterns already in the file you're editing rather than introducing a new one.
- **Backend:** keep route → controller → service/model separation. Routes stay thin; business logic lives in controllers/services. New routes are mounted under `/api/*` in `app.ts`.
- **App:** put screens in `app/` (routes), reusable UI in `src/components/`, and shared state in the Zustand stores under `src/stores/`. Use the `useTheme` hook for colors so light/dark mode keeps working.
- Don't commit secrets, `.env` files, or `node_modules`.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) — it matches the existing history:

```
feat: add location filtering for exercises
fix: update download link in README
docs: document calorie endpoints
chore: bump expo to 54.0.1
refactor: extract streak calculation into a service
```

Keep the subject line short and imperative; add a body if the change needs context.

## Pull requests

- Target the **`main`** branch.
- Give the PR a clear title and a description covering **what** changed and **why**.
- Link any related issue (`Closes #123`).
- Make sure CI is green — it runs backend typecheck + build and app typecheck.
- Include screenshots or a short clip for UI changes.
- Note any new environment variables and update `.env.example` and the README env table when you add them.

A maintainer will review and may request changes. Once approved, your PR gets merged. 🎉

## Reporting bugs & requesting features

Open a GitHub issue with:

- **Bugs:** what you expected, what happened, steps to reproduce, and your environment (OS, Node version, device/simulator). Include logs or screenshots where relevant.
- **Features:** the problem you're trying to solve and your proposed approach. Discussion before a large PR saves everyone time.

Thanks for helping make FitTrackr better!

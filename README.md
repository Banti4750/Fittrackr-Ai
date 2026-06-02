# FitTrackr

An AI-powered fitness tracking app. Log workouts, track personal records, see progress charts, get coaching insights from Claude.

🌐 Visit Page: https://staging.d3ul7t1mvo87vv.amplifyapp.com/

🌐 Download App: https://expo.dev/artifacts/eas/i4Bhr3tCHKLuVbqnxHYXWL.apk

```
/fittrackr-backend     Node.js + Express + MongoDB + Mongoose
/fittrackr-app         Expo (React Native) + TypeScript 
```

## Features

- JWT auth (register / login)
- Animated onboarding (Beginner / Intermediate / Elite)
- Dashboard with weekly stats, streak, AI insight of the day
- Active workout logger (sets × reps × weight, auto rest timer with push notification)
- Auto personal best detection per exercise
- Exercise library (85+ seeded exercises) — filter by muscle/category/level, search
- Per-exercise detail (image, instructions, tips, YouTube link, history chart)
- Progress: volume line chart, frequency bar chart, PR list, muscle breakdown
- Reusable workout templates (build your own or install starter routines)
- Calorie tracking with daily / weekly / monthly summaries
- AI insights powered by Gemini, Claude, or OpenAI with plateau / overtraining / progressive overload detection
- Streak tracker with calendar heatmap and milestone badges
- Body stats (weight, body fat, measurements, BMI) with progress photos and side-by-side comparison
- Light / dark mode (system-following)
- Cloudinary image uploads
- Expo push notifications

## Prerequisites

- Node 18+
- MongoDB running locally (or an Atlas URI)
- An AI provider key — Gemini, Claude, or OpenAI (all optional; without one the AI endpoint falls back to a deterministic local analysis). Priority is Gemini → Claude → OpenAI
- A Cloudinary account (optional, required for photo uploads)
- Expo CLI: `npm i -g expo` (or use `npx`)

---

## 1) Backend setup

```bash
cd fittrackr-backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, an AI key (GEMINI/CLAUDE/OPENAI), Cloudinary keys

npm install
npm run seed       # populate ~85 exercises
npm run dev        # starts on http://localhost:5000
```

`GET http://localhost:5000/health` should return `{ ok: true }`.

### Environment

| Variable                | Required | Notes                                      |
| ----------------------- | -------- | ------------------------------------------ |
| `PORT`                  | no       | defaults to 5000                           |
| `MONGODB_URI`           | yes      | e.g. `mongodb://127.0.0.1:27017/fittrackr` |
| `JWT_SECRET`            | yes      | long random string                         |
| `JWT_EXPIRES_IN`        | no       | default `30d`                              |
| `GEMINI_API_KEY`        | no       | highest-priority AI provider when set      |
| `GEMINI_MODEL`          | no       | default `gemini-2.0-flash`                 |
| `CLAUDE_API_KEY`        | no       | used when Gemini is unset                  |
| `CLAUDE_MODEL`          | no       | default `claude-sonnet-4-20250514`         |
| `OPENAI_API_KEY`        | no       | final fallback provider                    |
| `OPENAI_MODEL`          | no       | default `gpt-4o`                           |
| `CLOUDINARY_CLOUD_NAME` | no\*     | required if you use photo upload           |
| `CLOUDINARY_API_KEY`    | no\*     | "                                          |
| `CLOUDINARY_API_SECRET` | no\*     | "                                          |

### How AI insights work

`POST /api/ai/insights` aggregates the last 30 days of `WorkoutSession` data per exercise:

- total volume, sets, reps
- max weight session-by-session
- volume trend (`up` / `flat` / `down`)
- plateau detection (same max weight for ≥14 days)
- overtraining detection (7+ consecutive workout days)
- progressive overload (volume rising over time)

It builds a structured prompt, calls the configured provider (Gemini → Claude → OpenAI, in that order of priority), parses the JSON response, and caches the result as an `AIInsight` document with a 24-hour TTL. If no API key is set or the call fails, it returns a deterministic local fallback so the UI always has data to render.

---

## 2) Frontend setup

```bash
cd fittrackr-app
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_API_URL (use your LAN IP if testing on a device, not localhost)

npm install
npx expo start
```

Open the app in Expo Go (scan QR), an iOS Simulator, or an Android emulator.

### Architecture

```
app/                       expo-router file-based routes
  _layout.tsx              root layout, auth guard, query client
  index.tsx                redirect into auth group
  (auth)/                  welcome, login, register, onboarding
  (tabs)/                  home, log, exercises, progress, profile (bottom tabs)
  workout/active.tsx       active workout logger
  workout/[id].tsx         workout detail
  exercise/[id].tsx        exercise detail
  insights.tsx             AI insights
  streaks.tsx              streak + heatmap + milestones
  bodystats.tsx            body stats + photo compare

src/
  api/                     typed axios clients per resource
  components/              shared UI (cards, charts, set rows, rest timer, flame, ...)
  stores/                  Zustand: useAuthStore, useWorkoutStore, useUIStore
  theme/                   light/dark palette + useTheme hook
  utils/                   formatters
  types/                   TypeScript types shared across screens
```

### State

- `useAuthStore` — user + token, hydrate from secure store on launch
- `useWorkoutStore` — active workout draft (title, exercises, sets, mood)
- `useUIStore` — global loading flag

---

## 3) Try the happy path

1. Start the backend (`npm run dev` in `fittrackr-backend`).
2. Seed exercises (`npm run seed`).
3. Start the app (`npx expo start` in `fittrackr-app`).
4. Register → choose level → land on Dashboard.
5. Tap "Start a workout" → add 2-3 exercises → log sets → save.
6. Open the Progress tab — your volume chart populates.
7. Open Insights → tap **Regenerate** to get a Claude analysis.
8. Repeat for a few days to unlock the streak and PR badges.

---

## Notes

- The auth guard in `app/_layout.tsx` redirects unauthenticated users to `(auth)` and authenticated users away from it.
- PR detection runs server-side on `POST /api/workouts` by comparing each new set's `weight × reps` against the user's historical max for that exercise.
- The rest timer schedules a local push notification when it completes.
- Exercise images are seeded with deterministic placeholder URLs (`picsum.photos`); swap for Cloudinary uploads when you have them.
- Video URLs point at YouTube search results for the exercise so the link always works.
- If you don't have Cloudinary configured, the **+ photo** button on Body Stats will surface a configuration error — everything else works without it.

---

## Contributing

Contributions are welcome — bug fixes, features, docs, anything. Start with **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full local-setup, branching, and pull-request workflow.

The short version:

1. Fork and clone the repo.
2. Set up the backend and app (see sections 1 and 2 above).
3. Create a branch: `git checkout -b feat/your-thing`.
4. Make your change. Run `npm run typecheck` in both `fittrackr-backend` and `fittrackr-app` before pushing — CI runs the same checks (plus `npm run build` on the backend) on every PR.
5. Open a pull request against `main` with a clear description.

## License

Released under the [MIT License](LICENSE).

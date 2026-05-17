# FitTrackr

An AI-powered fitness tracking app. Log workouts, track personal records, see progress charts, get coaching insights from Claude.

🌐 Live Demo: https://staging.d3ul7t1mvo87vv.amplifyapp.com/

```
/fittrackr-backend     Node.js + Express + MongoDB + Mongoose + JWT
/fittrackr-app         Expo (React Native) + TypeScript + Zustand + React Query
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
- AI insights powered by Claude (or OpenAI) with plateau / overtraining / progressive overload detection
- Streak tracker with calendar heatmap and milestone badges
- Body stats (weight, body fat, measurements, BMI) with progress photos and side-by-side comparison
- Light / dark mode (system-following)
- Cloudinary image uploads
- Expo push notifications

## Prerequisites

- Node 18+
- MongoDB running locally (or an Atlas URI)
- An Anthropic Claude API key (recommended) or OpenAI API key — optional; without one the AI endpoint falls back to a deterministic local analysis
- A Cloudinary account (optional, required for photo uploads)
- Expo CLI: `npm i -g expo` (or use `npx`)

---

## 1) Backend setup

```bash
cd fittrackr-backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, CLAUDE_API_KEY (or OPENAI_API_KEY), Cloudinary keys

npm install
npm run seed       # populate ~85 exercises
npm run dev        # starts on http://localhost:5000
```

`GET http://localhost:5000/health` should return `{ ok: true }`.

### Environment

| Variable                  | Required | Notes                                        |
| ------------------------- | -------- | -------------------------------------------- |
| `PORT`                    | no       | defaults to 5000                             |
| `MONGODB_URI`             | yes      | e.g. `mongodb://127.0.0.1:27017/fittrackr`   |
| `JWT_SECRET`              | yes      | long random string                           |
| `JWT_EXPIRES_IN`          | no       | default `30d`                                |
| `CLAUDE_API_KEY`          | no       | Claude is preferred when set                 |
| `CLAUDE_MODEL`            | no       | default `claude-sonnet-4-20250514`           |
| `OPENAI_API_KEY`          | no       | fallback provider                            |
| `OPENAI_MODEL`            | no       | default `gpt-4o`                             |
| `CLOUDINARY_CLOUD_NAME`   | no\*     | required if you use photo upload             |
| `CLOUDINARY_API_KEY`      | no\*     | "                                            |
| `CLOUDINARY_API_SECRET`   | no\*     | "                                            |

### API reference

| Method | Path                              | Auth | Description                                |
| ------ | --------------------------------- | ---- | ------------------------------------------ |
| POST   | `/api/auth/register`              | —    | Create account, returns `{user, token}`    |
| POST   | `/api/auth/login`                 | —    | Returns `{user, token}`                    |
| GET    | `/api/auth/me`                    | yes  | Current user                               |
| GET    | `/api/exercises`                  | —    | `?muscle=&category=&level=&search=`        |
| GET    | `/api/exercises/:id`              | —    | Exercise detail                            |
| POST   | `/api/workouts`                   | yes  | Create session (auto-detects PRs)          |
| GET    | `/api/workouts`                   | yes  | `?startDate=&endDate=&page=&limit=`        |
| GET    | `/api/workouts/:id`               | yes  | Workout detail                             |
| PUT    | `/api/workouts/:id`               | yes  | Update                                     |
| DELETE | `/api/workouts/:id`               | yes  | Delete                                     |
| GET    | `/api/progress/volume`            | yes  | `?exercise=&range=7d|30d|90d`              |
| GET    | `/api/progress/personal-bests`    | yes  | List of PRs per exercise                   |
| GET    | `/api/progress/frequency`         | yes  | Workouts per week                          |
| GET    | `/api/progress/muscle-breakdown`  | yes  | Sets per muscle group                      |
| POST   | `/api/bodystats`                  | yes  | Create entry                               |
| GET    | `/api/bodystats`                  | yes  | Last 30                                    |
| GET    | `/api/bodystats/trend`            | yes  | Time series                                |
| GET    | `/api/streaks`                    | yes  | Streak + 90-day heatmap                    |
| GET    | `/api/users/profile`              | yes  | Profile                                    |
| PUT    | `/api/users/profile`              | yes  | Update                                     |
| PUT    | `/api/users/level`                | yes  | Set level                                  |
| POST   | `/api/ai/insights`                | yes  | Generate fresh insights (AI call)          |
| GET    | `/api/ai/insights/latest`         | yes  | Recent insights                            |
| POST   | `/api/upload/photo`               | yes  | multipart `file` — returns Cloudinary URL  |

### How AI insights work

`POST /api/ai/insights` aggregates the last 30 days of `WorkoutSession` data per exercise:

- total volume, sets, reps
- max weight session-by-session
- volume trend (`up` / `flat` / `down`)
- plateau detection (same max weight for ≥14 days)
- overtraining detection (7+ consecutive workout days)
- progressive overload (volume rising over time)

It builds a structured prompt, calls Claude (or OpenAI), parses the JSON response, and caches the result as an `AIInsight` document with a 24-hour TTL. If both API keys are missing or the call fails, it returns a deterministic local fallback so the UI always has data to render.

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

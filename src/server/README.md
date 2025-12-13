# Astra Backend (Cloudflare Workers)

Backend for the "astra-quiz-dash-main" Wordle/quiz game using Cloudflare Workers with Durable Objects.

## Quick start

1. Install deps: `bun install`
2. Dev server: `bun run dev`
3. Type check: `bun run check`
4. Deploy: `bun run deploy`

## API notes
- Frontend should persist a UUID in `localStorage` as `userId` and send it on every request header `x-user-id`.
- Endpoints:
  - `POST /api/user/init` – ensure user DO exists, returns full snapshot.
  - `GET /api/user` – get snapshot.
  - `POST /api/coins/add` body `{ amount }` – add coins.
  - `POST /api/coins/spend` body `{ amount }` – spend coins (400 if insufficient).
  - `POST /api/stats/update` body `{ statsPatch, name? }` – merge stats and/or update name.
- CORS allows same-origin and `http://localhost:5173`. Send `Content-Type` and `x-user-id` headers.

Durable Object binding: `USER_STATE` mapped to class `UserState` (see `wrangler.jsonc`).

## Frontend ROMT: Endpoint Usage (Wordle-focused)

**Base URL**
- Local dev: `http://localhost:8787`
- All routes prefixed with `/api/*`.

**Headers**
- `x-user-id`: Optional initially; backend generates one if missing and echoes it back. Persist and send on every call thereafter.
- `Content-Type`: `application/json` for POST.

### User
- `GET /api/user` → `{ user: UserRecordSanitized }`
- `POST /api/user/init` → `{ user: UserRecordSanitized }`
- `POST /api/coins/add` body `{ amount:number>0 }` → `{ balance, user }`
- `POST /api/coins/spend` body `{ amount:number>0 }` → `{ balance, user }`
- `POST /api/stats/update` body `{ name?:string, statsPatch?:Partial<GameStats> }` → `{ user }` (unsanitized)

`UserRecordSanitized` includes: `userId, name, coins, stats{ gamesPlayed, gamesWon, totalTime, wordle{ attempts?, lastWord? } }, createdAt, updatedAt, hintUses, searchUses, wordleSession? { gameId, wordLength, startedAt, expiresAt, attempts, guessTimestamps, remainingTime }`.

### Wordle
- Session duration ~70,000 ms; 6 attempts max; 5-letter words; rate limit ~20 guesses/min.

1) Start/resume: `GET /api/wordle/word`
  - New: `{ gameId, wordLength:5, remainingTime:70000 }`
  - Resume: `{ gameId, wordLength:5, remainingTime, resumed:true }`

2) Validate guess: `POST /api/wordle/validate`
  # Astra Games Backend

  This Cloudflare Worker Durable Object backend powers Wordle and Pop Quiz games.

  ## Auth and Base Path
  - All endpoints live under `/api` and require an `x-user-id` header.
  - If `x-user-id` is missing at the gateway, a UUID is generated and returned in the response header.

  ## Coins Helpers
  - `POST /api/coins/add { amount }` → adds coins
  - `POST /api/coins/spend { amount }` → spends coins
  - `GET  /api/user` → returns user snapshot (never includes any answer data)

  ---

  ## Pop Quiz API
  Critical constraint: the correct answer is never exposed over the network until the user submits their choice.

  ### Question Model (client payload)
  ```json
  {
    "id": "q1",
    "category": "general",
    "difficulty": "easy",
    "question": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Venus", "Jupiter"],
    "coinsReward": 5
  }
  ```
  - No `correctIndex` is ever returned.
  - Options are shuffled server-side per session and sent without any correctness indicator.

  ### Session Model (client snapshot)
  ```json
  {
    "id": "<uuid>",
    "userId": "<user>",
    "questionOrder": [2,0,1],
    "pointer": 0,
    "lives": 3,
    "score": 0,
    "coinsEarned": 0,
    "assistsUsed": { "fifty": 0, "freeze": 0 },
    "createdAt": "...",
    "updatedAt": "...",
    "state": "active"
  }
  ```
  - Server-only mapping of `correctIndex` and `optionShuffle` is stored internally and never returned.

  ### Endpoints

  - `GET /api/quiz/questions?limit=50&category=&difficulty=`
    - Returns a pool of questions with options shuffled per-session (if a session exists).
    - Never includes the correct index or text.

  - `POST /api/quiz/session/start`
    - Body: `{ "entryCost": number }`
    - Spends coins, creates a session with randomized `questionOrder` and assists counters.
    - Returns session snapshot (no answers) and updated `balance`.

  - `POST /api/quiz/session/:id/answer`
    - Body: `{ "selectedIndex": number }` (index into the server-shuffled options 0..3)
    - Server checks correctness using the internal mapping only.
    - Returns `{ correct, lives, score, coinsEarned, pointer, done, balance }`.
    - Does not return the correct index or text.

  - `POST /api/quiz/session/:id/assist/fifty`
    - Returns two indices to hide, chosen from wrong options in the client-shuffled space.
    - First 2 uses free; then costs 20 coins.
    - Returns `{ indices: number[2], charged, remainingFree, balance }`.

  - `POST /api/quiz/session/:id/assist/freeze`
    - Freezes timer for 8 seconds; prevents stacking.
    - First 2 uses free; then costs 10 coins.
    - Returns `{ freezeSeconds: 8, charged, balance }`.

  - `POST /api/quiz/session/:id/skip`
    - Moves current question to end and advances pointer.
    - Returns `{ pointer, done }`.

  - `POST /api/quiz/session/:id/end`
    - Ends session and returns summary (no answers).
    - Returns `{ summary: { id, score, coinsEarned, lives, totalQuestions, assistsUsed, state }, balance }`.

  ### Validation and Rate Limiting
  - Blocks assists or answers when session not `active`.
  - Prevents freeze stacking with `freezeUntil` and returns `429` if active.
  - Rate limits assists: max 3 calls per 30s window.

  ### Non-Disclosure Guarantees
  - No `correctIndex` or any derivable correctness data in GET payloads.
  - Avoid deterministic ordering tied to correctness; options are session-shuffled.
  - No hashes or correlating fields are returned to the client.

  ---

  ## Wordle API (existing)
  - Mirror of behavior with sessions and rate limits; see code for details.

  ---

  ## Local Testing (examples)
  Use `wrangler dev` or your chosen runner. Example HTTP calls (PowerShell):

  ```powershell
  # Start a quiz session
  $headers = @{ 'x-user-id' = 'user123'; 'Content-Type' = 'application/json' }
  Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/api/quiz/session/start' -Headers $headers -Body '{"entryCost":5}'

  # Fetch questions (shuffled options)
  Invoke-RestMethod -Method Get -Uri 'http://localhost:8787/api/quiz/questions?limit=50' -Headers $headers

  # Answer current question
  Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/api/quiz/session/<sessionId>/answer' -Headers $headers -Body '{"selectedIndex":1}'

  # Use assists
  Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/api/quiz/session/<sessionId>/assist/fifty' -Headers $headers
  Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/api/quiz/session/<sessionId>/assist/freeze' -Headers $headers

  # Skip and end
  Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/api/quiz/session/<sessionId>/skip' -Headers $headers
  Invoke-RestMethod -Method Post -Uri 'http://localhost:8787/api/quiz/session/<sessionId>/end' -Headers $headers
  ```

  ## Notes / TODO
  - Replace in-memory quiz pool with a database.
  - Add unit tests via your preferred framework (Vitest/Jest) and CI.
  - Persist quiz session state in Durable Object storage if needed for long-lived sessions.

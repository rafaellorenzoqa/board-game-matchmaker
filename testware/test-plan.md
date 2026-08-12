# Board Game Matchmaker — API Test Plan

**Scope:** API only (no UI exists in this project).
**Author:** Rafael
**Based on:** `context/VADER.txt` (VADER API heuristic) and `context/htsm.pdf` (Heuristic Test Strategy Model, J. Bach v6.3)
**Grounded in:** `src/`, `test/`, `data/`, `package.json`, `.env.example` as of this review.
**Current scope:** `/games` CRUD + `/auth/login`. `/questions` and `/recommendations` are deferred — see §10 Next
Steps.

---

## 1. Objective

Apply the VADER heuristic (Verbs, Authorization, Data, Errors, Responsiveness) to the routes this Express API
exposes, framed by HTSM's Project Environment / Product Factors / Quality Criteria so nothing structural gets
skipped. This is a personal portfolio project and my first time doing test automation, so the plan is scoped
deliberately: **for now, only the `/games` routes and `/auth/login` are in scope.** `/questions` and
`/recommendations` are real endpoints in the app but are intentionally deferred — see §10 Next Steps. The plan
distinguishes what is **already automated** from what is **planned**, tracks known validation gaps as a separate
backlog (§5) instead of mixing them into the test cases, and ranks every test case by priority (§6+).

## 2. System Under Test

Express 5 app (`src/app.js`) mounting four routers, no database — persistence is flat JSON files read/written
synchronously on every request (`src/utils/jsonFile.js`).

| Router | Base path | Auth required | Backing file | Scope |
|---|---|---|---|---|
| `auth.routes.js` | `/auth` | — | none (env-var credentials) | In scope now |
| `games.routes.js` | `/games` | POST/PUT/PATCH/DELETE only | `data/games.json` (overridable via `GAMES_FILE_PATH`) | In scope now |
| `questions.routes.js` | `/questions` | — | `data/questions.json` | Deferred — §10 |
| `recommendations.routes.js` | `/recommendations` | — | reads `data/games.json` via `gameStore` | Deferred — §10 |

Auth is a single hardcoded credential pair (`AUTH_USERNAME`/`AUTH_PASSWORD` from `.env`) exchanged for a JWT
(`JWT_SECRET`, 1h expiry) via `POST /auth/login`. There is one privilege level — no roles, no per-user scoping —
so VADER's "Authorization" axis here means exercising the three states that actually exist: **missing token**,
**invalid/malformed/expired token**, and **valid token**. That's the full authorization surface for this API, and
every protected route (`POST`/`PUT`/`PATCH`/`DELETE /games`) gets all three.

## 3. Test Environment & Tooling

- Runner: Mocha (`npm test` → `mocha test/**/*.test.js`), assertions: Chai, HTTP: Supertest.
- Existing pattern (`test/api/games.test.js`) redirects storage to a fixture file via `process.env.GAMES_FILE_PATH`
  before requiring the app, and rewrites that fixture in a `beforeEach` from `test/fixtures/initialGames.js`
  (4 games: ids 1, 2, 13, 116). New test files for `/games` and `/auth` should follow the same isolation pattern.
- No `.mocharc` and no CI config exist yet in the project.

## 4. Existing Automated Coverage (baseline)

`test/api/games.test.js` (34 tests) already covers, per endpoint:

- **GET /games**: returns a list (count check only, against the 4-game fixture).
- **POST /games**: 201 happy path incl. generated id; 400 for each individually-missing required field
  (name, minPlayers, maxPlayers, playTime, complexity); 400 for `complexity: null`; 401 missing token; 401
  invalid token.
- **PUT /games/:id**: 200 replace + idempotency check (same request twice → identical body); 400 incomplete
  payload; 401 missing/invalid token; 404 unknown id.
- **PATCH /games/:id**: 200 partial edit; 400 for `complexity: null`, `complexity` as string, `name` as number,
  `minPlayers`/`maxPlayers`/`playTime` as string; 401 missing/invalid token; 404 unknown id; verifies untouched
  fields survive a partial patch.

**Not covered yet, within the current scope:** `DELETE /games/:id` (in progress), `POST /auth/login` (no test file
exists yet), malformed-JSON body handling, and the cross-field/boundary cases listed in §6 below.

`/questions` and `/recommendations` have no tests and are intentionally out of scope for this version — see §10
Next Steps.

## 5. Known Issues / Backlog

These are validation gaps found while reading `validateFullGamePayload`/`validatePartialGamePayload`
(`src/routes/games.routes.js:15-48`) and the storage layer. None of these are bugs stumbled into by accident —
they're scope decisions made along the way ("didn't think it needed one yet") while building the CRUD routes.
Logging them here as a backlog to work through one at a time. Priority reflects risk if left unresolved, not
urgency — there's no fixed timeline for these.

1. [ ] **[P1] No cross-field validation.** `minPlayers ≤ maxPlayers` is never checked on POST/PUT/PATCH. Decide
   whether to add the check or explicitly document that it's not enforced.
2. [ ] **[P1] Numeric fields accept more than the docs promise.** Swagger describes `minPlayers`/`maxPlayers`/
   `playTime` as `integer`, but the code only checks `typeof === 'number'` — decimals, negative numbers, and `0`
   all pass. Decide: tighten the validator, or fix the docs.
3. [ ] **[P2] `complexity`'s documented 1–5 range isn't enforced.** Any number is currently accepted.
4. [ ] **[P2] PATCH's null-rejection isn't complexity-specific**, even though the Swagger doc for PATCH only calls
   out complexity. Sending `null` for `name`, `minPlayers`, `maxPlayers`, or `playTime` also 400s via the same
   `typeof` check. Decide whether to document this more broadly or leave the PATCH doc as-is.
5. [ ] **[P2] Unknown/extra body fields (including a client-supplied `id`) are silently dropped** on POST/PUT
   since only the five known fields are destructured. Probably fine — confirm it's intentional.
6. [ ] **[P2] Auth header parsing is strict and case-sensitive** (`Bearer` must be exact case, single space).
   Confirm that's the intended behavior before locking in a test for the exact error message.
7. [ ] **[P1] Non-numeric/leading-zero `:id` path params coerce via `Number()`.** `/games/abc` → `NaN` → falls
   through to a 404 (not a 400). `/games/01` coerces to `1` and matches the real game. Decide if malformed ids
   should 400 instead.
8. [ ] **[P1] No concurrency control on id generation.** `addGame` (`src/services/gameStore.js:12-21`)
   reads-then-writes synchronously with no locking; two simultaneous `POST /games` requests could theoretically
   collide on the same id.
9. [ ] **[P1] Oversized JSON bodies may fall through to a generic 500** instead of a `413`, since `app.js`'s
   error handler (`app.js:22-28`) only special-cases `SyntaxError`.

**Note — not a bug:** `data/games.json` is a temporary, testing-only data file, and some of its entries are
deliberately "wonky" as edge-case fixtures — e.g. game id 177 ("Radlands") has `minPlayers: 3, maxPlayers: 2` on
purpose, to give the eventual cross-field validation test something real to catch. This is by design, not
something to fix.

## 6. Test Design (VADER per endpoint)

Status used in every table below: **Automated** = covered by an existing test file · **Planned** = designed here,
not yet written. `/questions` and `/recommendations` test design has moved to §10 Next Steps and isn't included
in this section, since they're deferred.

**Priority** — risk-based, not schedule-based: **P0** = core correctness or security (auth, core CRUD happy
paths, anything that could let bad data in or let the wrong person write data); **P1** = meaningful edge cases and
error handling that a real user or API consumer could plausibly hit; **P2** = rare edge cases, cosmetic/contract
details, or items whose value depends on an undecided backlog item.

### 6.1 `POST /auth/login` — no test file exists yet

| # | Case | VADER | Priority | Status |
|---|---|---|---|---|
| 1 | Valid username+password → 200, response has `token`, decodable JWT, `username` claim matches | V, D | P0 | Planned |
| 2 | Token from #1 is accepted by a protected route (e.g. `POST /games`) | A | P0 | Planned |
| 3 | Missing `username` → 400, error mentions required fields | D, E | P1 | Planned |
| 4 | Missing `password` → 400 | D, E | P1 | Planned |
| 5 | Both missing / empty body → 400 | D, E | P1 | Planned |
| 6 | Wrong password, correct username → 401 "Invalid username or password." | A | P0 | Planned |
| 7 | Wrong username, correct password → 401 | A | P1 | Planned |
| 8 | Both wrong → 401 | A | P1 | Planned |
| 9 | Empty-string username/password → 400 (falsy, hits the "required" branch, not the "invalid" branch — confirm which) | D, E | P2 | Planned |
| 10 | Response never leaks the password back in any field | Security/Data | P0 | Planned |
| 11 | Token actually expires per its 1h `expiresIn` (sign a token with a near-past/very short expiry using the same `JWT_SECRET` and confirm a protected route 401s with "Invalid or expired token.") | R, A | P0 | Planned |

### 6.2 `GET /games` — currently count-only; expand

| # | Case | VADER | Priority | Status |
|---|---|---|---|---|
| 1 | Returns 200 + array matching fixture length | V | P0 | Automated |
| 2 | Response items contain exactly `id, name, minPlayers, maxPlayers, playTime, complexity` | D | P1 | Planned |
| 3 | No auth header required — still 200 | A | P1 | Planned |
| 4 | Empty store (`writeJsonFile` fixture to `[]`) → 200 with `[]`, not an error | D | P1 | Planned |
| 5 | Field types in response match what was stored (numbers stay numbers, `complexity: null` preserved for games that have it) | D | P2 | Planned |

### 6.3 `POST /games` — mostly automated; add cross-field/domain cases

| # | Case | VADER | Priority | Status |
|---|---|---|---|---|
| 1–7 | Happy path 201; 400 per missing field (name/minPlayers/maxPlayers/playTime/complexity); 400 `complexity: null`; 401 missing/invalid token | — | P0 | Automated |
| 8 | `minPlayers > maxPlayers` (e.g. 5/2) — behavior depends on §5 item 1 decision | D | P1 | Planned |
| 9 | `minPlayers` / `maxPlayers` as decimals (e.g. `2.5`) — behavior depends on §5 item 2 decision | D | P1 | Planned |
| 10 | Negative numbers for `minPlayers`, `maxPlayers`, `playTime` | D | P1 | Planned |
| 11 | `complexity` outside documented 1–5 (e.g. `-3`, `99`) — behavior depends on §5 item 3 decision | D | P2 | Planned |
| 12 | `0` accepted for numeric fields (falsy-but-valid boundary) | D | P2 | Planned |
| 13 | Empty-string / whitespace-only `name` → 400 (code explicitly trims) | D | P1 | Planned |
| 14 | Extra/unknown field in body (e.g. `foo: "bar"`, or client-supplied `id`) → 201, extra fields dropped, server `id` used | D | P1 | Planned |
| 15 | New id continues from the correct max after prior deletions in the same run | D | P1 | Planned |
| 16 | Auth header with lowercase `bearer` → 401 with the "must be in the format" message (distinct from invalid-token message) | A | P1 | Planned |
| 17 | Auth header `Bearer` with no token after it → 401 malformed-scheme message | A | P1 | Planned |
| 18 | Expired token (see §6.1 #11) → 401 "Invalid or expired token." | A | P0 | Planned |
| 19 | Malformed JSON body (`Content-Type: application/json` with broken JSON) → 400 "Invalid JSON in request body" | E | P1 | Planned |
| 20 | Response `Content-Type` is `application/json` | R/D | P2 | Planned |

### 6.4 `PUT /games/:id` — mostly automated; add id-format and cross-field cases

| # | Case | VADER | Priority | Status |
|---|---|---|---|---|
| 1–5 | 200 replace + idempotency; 400 incomplete payload; 401 missing/invalid token; 404 unknown id | — | P0 | Automated |
| 6 | Non-numeric id (`/games/abc`) → currently 404 (NaN never matches), not 400 — behavior depends on §5 item 7 decision | D, E | P1 | Planned |
| 7 | Leading-zero id (`/games/01`) coerces to `1` and replaces the real game — behavior depends on §5 item 7 decision | D | P2 | Planned |
| 8 | Decimal id (`/games/1.5`) → 404 | D | P2 | Planned |
| 9 | Same cross-field/domain cases as POST #8–13, on PUT | D | P1 | Planned |
| 10 | Full replace drops any previously-set data not in the new payload (true replace, not merge) | D | P1 | Planned |

### 6.5 `PATCH /games/:id` — mostly automated; extend null-rejection to all fields

| # | Case | VADER | Priority | Status |
|---|---|---|---|---|
| 1–10 | 200 edit; 400 `complexity` null/string; 400 `name`/`minPlayers`/`maxPlayers`/`playTime` wrong type; 401 missing/invalid; 404 unknown; untouched fields preserved | — | P0 | Automated |
| 11 | `name: null`, `minPlayers: null`, `maxPlayers: null`, `playTime: null` each individually → 400 (only `complexity: null` is currently tested, per §5 item 4) | D, E | P1 | Planned |
| 12 | Empty body `{}` → 200, no fields change (updates object ends up empty) | D | P1 | Planned |
| 13 | Multiple fields patched at once → all applied, others untouched | D | P1 | Planned |
| 14 | Cross-field domain cases (decimal/negative min/max, out-of-range complexity) via PATCH | D | P2 | Planned |
| 15 | PATCH with `minPlayers` that, combined with existing `maxPlayers`, creates `min > max` — behavior depends on §5 item 1 decision | D | P2 | Planned |

### 6.6 `DELETE /games/:id` — in progress, no test file yet

| # | Case | VADER | Priority | Status |
|---|---|---|---|---|
| 1 | Valid id, valid token → 204, empty body | V | P0 | Planned |
| 2 | Game is actually gone from a subsequent `GET /games` | V, D | P0 | Planned |
| 3 | Missing token → 401 | A | P0 | Planned |
| 4 | Invalid token → 401 | A | P0 | Planned |
| 5 | Unknown id → 404, error message includes the id | E | P1 | Planned |
| 6 | Non-numeric id → 404 (per NaN-coercion behavior, consistent with PUT/PATCH; see §5 item 7) | D, E | P2 | Planned |
| 7 | Delete the same id twice → first 204, second 404 | E | P1 | Planned |
| 8 | Deleting all games then `GET /games` → 200 `[]` | D | P1 | Planned |
| 9 | Deleting all games then `POST /games` → new id resets to 1 (per `addGame`'s `games.length > 0 ? max+1 : 1`, `gameStore.js:14`) | D | P1 | Planned |

## 7. Cross-Cutting API Tests (whole app, not one route)

| # | Case | VADER / HTSM technique | Priority | Status |
|---|---|---|---|---|
| 1 | Malformed JSON body on any POST/PUT/PATCH → 400 `{ error: 'Invalid JSON in request body' }` (`app.js:22-25`) | E | P1 | Planned |
| 2 | Request to an undefined route (e.g. `GET /nope`) → Express default 404 (no custom handler exists — confirm default behavior/body shape) | E | P2 | Planned |
| 3 | Wrong HTTP verb on a real path (e.g. `PATCH /auth/login`, since only `POST` is defined there) → Express default 404/405 behavior | E | P2 | Planned |
| 4 | Oversized JSON body (> default 100kb `express.json()` limit) on a protected route → confirm actual status (currently falls to the generic 500 branch per §5 item 9, not a 413) | Stress | P1 | Planned |
| 5 | `GET /api-docs` (Swagger UI, mounted in `app.js:15`) loads without error — smoke check that route registration didn't break docs | Claims/Tool-supported | P2 | Planned |
| 6 | Two concurrent `POST /games` requests (fired without awaiting each other) do not produce duplicate ids | Stress / Concurrency (§5 item 8) | P1 | Planned |

## 8. Test Technique Mapping (HTSM General Test Techniques)

- **Function Testing** — §6, one case set per verb per route.
- **Domain Testing** — boundary/type values throughout §6 (decimals where integers are documented, negatives, 0,
  null, empty arrays/strings, leading-zero and non-numeric ids).
- **Claims Testing** — §5 items 2–4 directly challenge the Swagger doc's claims (`integer` type, 1–5 complexity
  range, complexity-only null restriction) against what the code actually enforces.
- **Risk Testing** — §5 items 1, 8, 9 were derived by asking "what could break this" against the actual
  validation/storage code, then turned into test cases; the deliberately seeded edge-case data noted at the end of
  §5 exists specifically to support this.
- **Stress Testing** — §7 items 4 and 6 (payload size, concurrent writes).
- **Error Handling** — malformed JSON, unknown routes, 404 vs 400 semantics for bad ids throughout.
- **Scenario Testing** — deferred along with `/questions` → `/recommendations` (§10 Next Steps). For the current
  scope, the closest equivalent is the login → CRUD sequence: log in (§6.1), then create/update/delete a game
  (§6.3–6.6).
- Not applicable here: **User Testing** (no distinct user roles), **Flow/State Transition Testing** beyond the
  simple auth-then-CRUD sequence, **list pagination** (VADER "D" — `GET /games` returns the full array, no
  pagination params exist to test).

## 9. Out of Scope

Permanently out of scope for this project (not planned at all):

- UI/browser testing — no frontend exists in this repo.
- Load/performance benchmarking beyond the single concurrency and payload-size checks in §7.
- Infrastructure/deployment testing (no CI config, no Dockerfile present in the project).
- Security testing beyond the auth boundary already covered (no pen-testing, no fuzzing).

`/questions` and `/recommendations` are *not* out of scope — they're deferred. See §10 Next Steps.

## 10. Next Steps

Deferred work — real endpoints in the app, not yet planned for automation in this version.

### 10.1 `GET /questions`

No auth, no fixture override — always reads the live `data/questions.json` (currently 3 questions: `playerCount`,
`timeAvailable`, `complexity`, all `type: "number"`). When this is picked back up:

| # | Case | VADER | Priority |
|---|---|---|---|
| 1 | 200, array of exactly 3 questions (matches live `data/questions.json` at time of writing) | V | P1 |
| 2 | Each item has `id` (string), `text` (string), `type` (string) | D | P1 |
| 3 | No auth required | A | P2 |
| 4 | Response `Content-Type` is `application/json` | R | P2 |

Since this endpoint has no fixture override, prefer structural assertions (field presence/types, non-empty array)
over hardcoding exact question text, so the test doesn't break the moment `data/questions.json` is edited.

### 10.2 `POST /recommendations`

Scoring logic (`src/services/matching.js`): `playerCount` match = +3, `timeAvailable` match = +2 (game's
`playTime <= timeAvailable`), `complexity` match = +2 if `|game.complexity - answer.complexity| <= 1`; only games
with `score > 0` are returned, sorted desc, capped at 3. Validation only checks that `answers` is an array — it
doesn't validate individual answer shape.

| # | Case | VADER | Priority |
|---|---|---|---|
| 1 | `answers` matching a known fixture game on all 3 criteria → that game ranks first with all 3 reasons joined by `; ` | V, D | P0 |
| 2 | `answers: []` (valid array, no criteria) → 200, `recommendations: []` (no game scores > 0) | D | P1 |
| 3 | `answers` missing entirely → 400 with the documented error message | E, D | P1 |
| 4 | `answers` present but not an array (e.g. an object or string) → 400 | E, D | P1 |
| 5 | Unknown `questionId` in an answer → ignored, no crash, no score contribution | D, E | P2 |
| 6 | `playerCount` answer as a non-number (e.g. string) → ignored, no crash | D | P2 |
| 7 | Game(s) with `complexity: null` never match on the complexity criterion, and never crash the comparison | D | P1 |
| 8 | More than 3 games score > 0 → response capped at 3, highest scores first | D | P1 |
| 9 | Tie in score between two games → order is stable (insertion/original array order preserved) | D | P2 |
| 10 | No auth header required — still 200 | A | P1 |
| 11 | Duplicate `questionId` entries in `answers` → first match wins (per `Array.find`) | D | P2 |

### 10.3 Other deferred items

- Work through §5 Known Issues one at a time and decide fix-vs-document for each.
- Once `/questions` test coverage exists, consider whether it needs its own env-var override (like
  `GAMES_FILE_PATH`) for `data/questions.json` so tests don't depend on the live file.

## 11. Open Decisions

No dev team to hand these off to — these are calls to make solo. Full context for each is in §5 Known Issues;
this is just the short list of yes/no decisions:

1. Should `minPlayers > maxPlayers` be rejected?
2. Should non-numeric/malformed `:id` path params 400 instead of falling through to 404?
3. Should `minPlayers`/`maxPlayers`/`playTime` reject non-integers to match the Swagger contract?
4. Should `complexity` enforce its documented 1–5 range?
5. Is the oversized-payload → 500 (instead of 413) acceptable?

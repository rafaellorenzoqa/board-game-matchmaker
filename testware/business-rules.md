# Business Rules — Board Game Matchmaker API

Source of truth for formal test case design. Each rule has a sequential ID, with its endpoint
in parenthesis, for traceability from test cases back to this document.

Confirmed against the live source (`src/routes/*.js`, `src/services/*.js`,
`src/middleware/auth.js`) as of this session.

---

## 1. Authentication & Authorization

| ID | Rule |
|---|---|
| RN 01 (Auth) | The system has exactly one administrative user, identified by a single fixed username/password pair. This is the permanent intended design — not a placeholder for future multi-user or role-based access. |
| RN 02 (Auth) | `POST /auth/login` requires both `username` and `password` in the request body. Either missing → `400`. |
| RN 03 (Auth) | Login succeeds only if both `username` and `password` exactly match the configured admin credentials. Any mismatch → `401`, regardless of which field was wrong. |
| RN 04 (Auth) | On successful login, the system issues a signed JWT valid for 1 hour. |
| RN 05 (Auth) | Every write operation on `/games` (`POST`, `PUT`, `PATCH`, `DELETE`) requires a valid, unexpired token, sent as `Authorization: Bearer <token>`. |
| RN 06 (Auth) | `GET /games`, `GET /questions`, and `POST /recommendations` require no authentication. |
| RN 07 (Auth) | A missing `Authorization` header, a malformed scheme (not exactly `Bearer <token>`), or a token that fails signature/expiry verification all result in `401`. |

---

## 2. Game Record — Field Rules

These apply to any operation that creates or modifies a game (`POST`, `PUT`, and, for `PATCH`,
any field that is actually sent).

| ID | Rule |
|---|---|
| RN 08 (Games) | `id` is assigned by the system on creation and can never be set or changed by the client. It is the next integer after the current highest `id` in the collection (or `1` if the collection is empty). Once a game is deleted, its `id` is never reused by a future creation. |
| RN 09 (Games) | `name` is required and must be a non-empty string. A string consisting only of whitespace is invalid. |
| RN 10 (Games) | `minPlayers` is required and must be a positive integer (≥ 1). Zero, negative numbers, and decimals are invalid. |
| RN 11 (Games) | `maxPlayers` is required and must be a positive integer (≥ 1). Zero, negative numbers, and decimals are invalid. |
| RN 12 (Games) | `minPlayers` must be less than or equal to `maxPlayers`. Equal values are valid (e.g. `min: 1, max: 1` for a solo-only game; `min: 2, max: 2` for an exclusively two-player game). |
| RN 13 (Games) | `playTime` is required and must be a positive integer, in minutes. Zero, negative numbers, and decimals are invalid. |
| RN 14 (Games) | `complexity` is required and must be a number between `1` and `5` inclusive. Decimals are valid (the field follows BGG's continuous weight scale, e.g. `3.28`) — this is the one exception to the "integers only" rule above. `1` represents the lightest possible game; `5` represents the heaviest possible game. |
| RN 15 (Games) | `complexity` can never be set to `null` through any write operation (`POST`, `PUT`, or `PATCH`). Existing records with `complexity: null` in the data represent legacy/unrated entries only — `null` is not a value any client can write. |

---

## 3. Games — Endpoint Behavior

| ID | Rule |
|---|---|
| RN 16 (Games) | `GET /games` returns every game in the collection, unfiltered and unpaginated. |
| RN 17 (Games) | `POST /games` requires all fields from Section 2. A valid request creates one new game and returns it, including its system-assigned `id`, with status `201`. |
| RN 18 (Games) | `PUT /games/{id}` fully replaces the identified game. All fields from Section 2 are required, identical validation to `POST`. The `id` is taken from the URL, not the body — if an `id` is present in the body, it is ignored. |
| RN 19 (Games) | `PUT` is idempotent: sending the same valid payload to the same `id` multiple times in a row always results in the same final state. |
| RN 20 (Games) | `PATCH /games/{id}` updates only the fields present in the request body. Fields not included are left unchanged. Any field that is sent must still satisfy its rule from Section 2 (including RN 15 — `complexity` can never be sent as `null` in a `PATCH` either). |
| RN 21 (Games) | `DELETE /games/{id}` permanently removes the game. Success returns `204` with no response body. |
| RN 22 (Games) | `PUT`, `PATCH`, and `DELETE` all return `404` if no game with the given `id` exists — this includes both a non-existent numeric `id` and a syntactically invalid `id` (e.g. non-numeric path segment), which is treated as "not found," not as a server error. |
| RN 23 (Games) | `POST`, `PUT`, `PATCH`, and `DELETE` all return `401` if the request is missing valid authorization, before any other validation is evaluated. |

---

## 4. Questionnaire

| ID | Rule |
|---|---|
| RN 24 (Questions) | `GET /questions` returns the fixed set of questions used to drive recommendations: `playerCount`, `timeAvailable`, `complexity`. No authentication required. |
| RN 25 (Questions) | The set of question IDs returned by this endpoint must always match the set of question IDs the recommendation engine (Section 5) knows how to score. |

---

## 5. Recommendations

| ID | Rule |
|---|---|
| RN 26 (Recommendations) | `POST /recommendations` requires a body containing `answers` as an array. If `answers` is missing or not an array, the response is `400`. No authentication required. |
| RN 27 (Recommendations) | Each entry in `answers` is an object with a `questionId` and an `answer` value. |
| RN 28 (Recommendations) | The same `questionId` must not appear more than once in a single `answers` array. A request containing a duplicate `questionId` is invalid and must be rejected with `400`. |
| RN 29 (Recommendations) | A game matches the `playerCount` criterion if the submitted player count falls within the game's `minPlayers`–`maxPlayers` range (inclusive). |
| RN 30 (Recommendations) | A game matches the `timeAvailable` criterion if the game's `playTime` is less than or equal to the submitted available time. |
| RN 31 (Recommendations) | A game matches the `complexity` criterion if the absolute difference between the game's `complexity` and the submitted value is 1 or less (a tolerance band, not an exact match). |
| RN 32 (Recommendations) | A game whose `complexity` is `null` is never evaluated against the `complexity` criterion — it is neither matched nor penalized for that criterion; scoring proceeds using only the criteria that apply. |
| RN 33 (Recommendations) | A `questionId` that isn't one of the recognized question IDs (Section 4) has no effect on scoring — it is not an error, it simply matches nothing. |
| RN 34 (Recommendations) | A game is only eligible for recommendation if it matches at least one submitted criterion. Games matching zero criteria are excluded entirely. |
| RN 35 (Recommendations) | Eligible games are ranked by total number of matched criteria, highest first. |
| RN 36 (Recommendations) | At most 3 games are returned, even if more than 3 are eligible. If fewer than 3 games are eligible, all eligible games are returned. If zero games are eligible, an empty list is returned — this is not an error condition. |
| RN 37 (Recommendations) | Each returned game includes a human-readable explanation of which specific criteria it matched. |

# Board Game Matchmaker

A small Node.js/Express API that stores a (currently mine) board game collection and recommends games from it based on a
questionnaire. I intend on using this to introduce new games to non-Board Gamers. This is my **personal portfolio project for Julio de Lima's Mentoria JL 2.0**, built to showcase
what I'm learning about **API test automation**.

The API itself is a secondary goal for now. The main focus of this phase is building a solid, business-rules-
driven automated test suite around it (see [Testing](#testing) below). Once that's in a good place and I'm confident, the plan is
to keep building this out into a fully working board game recommendation app (persistent database, a real
frontend, user accounts, etc.) — see [Roadmap](#roadmap).

## Tech Stack

- **Runtime:** Node.js, Express 5
- **Auth:** JWT (`jsonwebtoken`) — a single hardcoded credential pair for now
- **Docs:** OpenAPI/Swagger, served at `/api-docs` via `swagger-jsdoc` + `swagger-ui-express`
- **Storage:** JSON files (`data/games.json`, `data/questions.json`) — no database yet
- **Testing:** Mocha + Chai + Supertest

## API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Exchange username/password for a JWT |
| GET | `/games` | — | List all games |
| POST | `/games` | Bearer token | Add a game |
| PUT | `/games/:id` | Bearer token | Replace a game (full update) |
| PATCH | `/games/:id` | Bearer token | Partially update a game |
| DELETE | `/games/:id` | Bearer token | Remove a game |
| GET | `/questions` | — | List the matchmaking questionnaire |
| POST | `/recommendations` | — | Get 1–3 recommended games from questionnaire answers |

Full request/response schemas are documented in Swagger — see [Getting Started](#getting-started).

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your own values
npm start
```

The server listens on `PORT` from `.env` (defaults to `3000`). Once running:

- API base: `http://localhost:3000`
- Interactive API docs: `http://localhost:3000/api-docs`

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (defaults to `3000`) |
| `AUTH_USERNAME` / `AUTH_PASSWORD` | The single fixed admin credential pair for `POST /auth/login` |
| `JWT_SECRET` | Secret used to sign/verify JWTs |

Log in via `POST /auth/login` with the `AUTH_USERNAME`/`AUTH_PASSWORD` from your `.env` to get a JWT, then send it
as `Authorization: Bearer <token>` on the protected `/games` routes.

## Testing

```bash
npm test
```

Runs the Mocha suite (`test/**/*.test.js`) with Chai assertions and Supertest for HTTP calls against the app.

Every behavior is driven by a formal, numbered **business rules document**, and testing follows an
**ISO-29119-3-based test plan and strategy**. Both live in [`testware/`](testware), and the test plan is also
published on this repo's wiki in browsable form:

- [`testware/business-rules.md`](testware/business-rules.md) — 37 numbered rules (RN 01–RN 37) covering auth,
  game field validation, endpoint behavior, the questionnaire, and recommendation scoring.
- [`testware/test-plan-and-strategy.md`](testware/test-plan-and-strategy.md) — user stories, 70 test conditions
  (C01–C70) traced back to individual business rules, exploratory testing missions, non-functional tests, and
  known defects.

**→ [Test Plan on the wiki](https://github.com/rafaellorenzoqa/board-game-matchmaker/wiki)**

All 70 documented conditions (C01–C70) are currently automated, since this project is focused exclusively on
API-layer test automation.

### Known Limitations

- **PATCH and `minPlayers`/`maxPlayers`**: the relational check (`minPlayers <= maxPlayers`) on
  `PATCH /games/{id}` only applies when both fields are sent in the same request — it isn't checked against the
  currently stored value when only one of the two is sent.
- **No write-locking**: the flat-file JSON storage has no locking, so near-simultaneous writes can overwrite
  each other, with the last write silently winning.

See [Known Defects](testware/test-plan-and-strategy.md#8-known-defects) in the test plan for full details.

## Roadmap

- WIP: Full business-rules-driven test coverage across all `/games`, `/auth`, `/questions`, and `/recommendations`
  endpoints (70 conditions, C01–C70)
- [ ] Resolve the two known defects tracked above
- [ ] Move from flat-file storage to a real database
- [ ] Build a frontend so this becomes an actual usable game-recommendation app

## License

ISC — see `package.json`.

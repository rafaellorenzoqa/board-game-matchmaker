# Board Game Matchmaker

A small Node.js/Express API that stores a board game collection and recommends games from it based on a
questionnaire. This is my **personal portfolio project for Julio de Lima's Mentoria JL 2.0**, built to showcase
what I'm learning about **API test automation** — it's also my first time writing test automation at all.

The API itself is a secondary goal for now. The main focus of this phase is building a solid, heuristic-driven
automated test suite around it (see [Testing](#testing) below). Once that's in a good place, the plan is to keep
building this out into a fully working board game recommendation app (persistent database, a real frontend, user
accounts, etc.) — see [Roadmap](#roadmap).

## Tech Stack

- **Runtime:** Node.js, Express 5
- **Auth:** JWT (`jsonwebtoken`) — a single hardcoded credential pair for now
- **Docs:** OpenAPI/Swagger, served at `/api-docs` via `swagger-jsdoc` + `swagger-ui-express`
- **Storage:** flat JSON files (`data/games.json`, `data/questions.json`) — no database yet
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

Log in via `POST /auth/login` with the `AUTH_USERNAME`/`AUTH_PASSWORD` from your `.env` to get a JWT, then send it
as `Authorization: Bearer <token>` on the protected `/games` routes.

## Testing

```bash
npm test
```

Runs the Mocha suite (`test/**/*.test.js`) with Chai assertions and Supertest for HTTP calls against the app.

The test strategy is documented as a living **API Test Plan** on this repo's wiki, built using the VADER heuristic
(Verbs, Authorization, Data, Errors, Responsiveness) and James Bach's Heuristic Test Strategy Model:

**→ [API Test Plan on the wiki](https://github.com/rafaellorenzoqa/board-game-matchmaker/wiki/Test-Plan)**

Current focus is full VADER coverage of `/games` (all CRUD verbs) plus `/auth/login`. `/questions` and
`/recommendations` are real endpoints already in the code but are intentionally deferred — tracked in the plan's
Next Steps section, alongside a running backlog of validation gaps found while writing the tests.

## Roadmap

- [ ] Finish VADER-based test coverage for `/games` + `/auth` (in progress)
- [ ] Resolve the validation-gap backlog tracked in the test plan
- [ ] Extend test automation to `/questions` and `/recommendations`
- [ ] Move from flat-file storage to a real database
- [ ] Build a frontend so this becomes an actual usable game-recommendation app

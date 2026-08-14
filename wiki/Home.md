# Test Plan and Strategy

**Board Game Matchmaker API — Test Automation Portfolio Project**

_Based on ISO-29119-3._

---

## 1. Epic and Overall Test Effort Estimate

Epic: Board Game Matchmaker API — Business Rules Validation

Overall Effort: High

## 2. User Stories and Test Effort Estimate

| Code | Description | Effort |
|---|---|---|
| US 1 | Authentication |  |
| US 2 | Create a New Game (POST /games) |  |
| US 3 | List All Games (GET /games) |  |
| US 4 | Fully Replace a Game (PUT /games/{id}) |  |
| US 5 | Partially Update a Game (PATCH /games/{id}) |  |
| US 6 | Delete a Game (DELETE /games/{id}) |  |
| US 7 | List Questionnaire (GET /questions) |  |
| US 8 | Get Game Recommendations (POST /recommendations) |  |

## 3. Test Conditions and Layers

### US 1: Authentication

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C01 | Login with correct username and password succeeds (RN 01, RN 03) | 200 OK; response body includes a valid JWT token | API |
| C02 | Login with missing username is rejected (RN 02) | 400 Bad Request; error indicates username and password are required | API |
| C03 | Login with missing password is rejected (RN 02) | 400 Bad Request; error indicates username and password are required | API |
| C04 | Login with correct username and wrong password is rejected (RN 03) | 401 Unauthorized; generic invalid-credentials error | API |
| C05 | Login with wrong username and correct password is rejected (RN 03) | 401 Unauthorized; generic invalid-credentials error | API |
| C06 | Login with both fields wrong is rejected (RN 03) | 401 Unauthorized; generic invalid-credentials error | API |
| C07 | A successful login returns a token valid for 1 hour (RN 04) | Decoded token's expiry (exp) is exactly 1 hour after issuance (iat) | API |
| C08 | A protected write request with no Authorization header is rejected (RN 05, RN 07) | 401 Unauthorized; "Authorization header is required" error | API |
| C09 | A protected write request with a malformed Authorization scheme is rejected (RN 07) | 401 Unauthorized; "Authorization header must be in the format: Bearer <token>" error | API |
| C10 | A protected write request with an invalid or expired token is rejected (RN 07) | 401 Unauthorized; "Invalid or expired token" error | API |
| C11 | GET /games succeeds without authentication (RN 06) | 200 OK; full games list returned | API |
| C12 | GET /questions succeeds without authentication (RN 06) | 200 OK; questions list returned | API |
| C13 | POST /recommendations succeeds without authentication (RN 06) | 200 OK; recommendations returned | API |

### US 2: Create a New Game (POST /games)

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C14 | A fully valid game is created and assigned a sequential id (RN 08, RN 17) | 201 Created; response includes the new game with an id one greater than the current highest | API |
| C15 | Creating a game with an empty or whitespace-only name is rejected (RN 09) | 400 Bad Request; error references name | API |
| C16 | Creating a game with a non-string name is rejected (RN 09) | 400 Bad Request; error references name | API |
| C17 | Creating a game with minPlayers as zero, negative, or a decimal is rejected (RN 10) | 400 Bad Request; error references minPlayers | API |
| C18 | Creating a game with maxPlayers as zero, negative, or a decimal is rejected (RN 11) | 400 Bad Request; error references maxPlayers | API |
| C19 | Creating a game where minPlayers is greater than maxPlayers is rejected (RN 12) | 400 Bad Request; error references the minPlayers/maxPlayers relationship | API |
| C20 | Creating a game where minPlayers equals maxPlayers is accepted (RN 12) | 201 Created | API |
| C21 | Creating a game with playTime as zero, negative, or a decimal is rejected (RN 13) | 400 Bad Request; error references playTime | API |
| C22 | Creating a game with complexity outside the 1-5 range is rejected (RN 14) | 400 Bad Request; error references complexity | API |
| C23 | Creating a game with complexity exactly at 1 or exactly at 5 is accepted (RN 14) | 201 Created | API |
| C24 | Creating a game with complexity as null is rejected (RN 15) | 400 Bad Request; error references complexity | API |
| C25 | Creating a game without authentication is rejected (RN 23) | 401 Unauthorized | API |

### US 3: List All Games (GET /games)

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C26 | All games in the collection are returned (RN 16) | response array length equals the total number of games in the collection | API |
| C27 | The response is not filtered or paginated (RN 16) | 200 OK; unrecognized query parameters have no effect on response size | API |
| C28 | A game with complexity: null is returned without error | 200 OK; the record's complexity field is null in the response | API |
| C29 | The endpoint succeeds without authentication (RN 06) | 200 OK; no Authorization header required | API |

### US 4: Fully Replace a Game (PUT /games/{id})

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C30 | A fully valid replacement updates the game and returns it (RN 18) | 200 OK; response reflects the new field values | API |
| C31 | An id included in the request body is ignored in favor of the URL id (RN 18) | 200 OK; response id matches the URL id, not any id sent in the body | API |
| C32 | Sending the same valid payload repeatedly produces an identical result each time (RN 19) | 200 OK on every call; identical response body each time | API |
| C33 | Replacing a non-existent numeric id returns 404 (RN 22) | 404 Not Found | API |
| C34 | Replacing a non-numeric id returns 404, not 500 (RN 22) | 404 Not Found | API |
| C35 | A replacement missing any required field is rejected (RN 09-14) | 400 Bad Request | API |
| C36 | A replacement with complexity: null is rejected (RN 15) | 400 Bad Request; error references complexity | API |
| C37 | A replacement without authentication is rejected (RN 23) | 401 Unauthorized | API |

### US 5: Partially Update a Game (PATCH /games/{id})

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C38 | Updating a single field leaves all other fields unchanged (RN 20) | 200 OK; only the sent field changes, all other fields match the original record | API |
| C39 | A sent field that fails its validation rule is rejected (RN 09-14, applied conditionally) | 400 Bad Request; error references the failing field | API |
| C40 | Sending complexity: null is rejected (RN 15, RN 20) | 400 Bad Request; error references complexity | API |
| C41 | Updating a non-existent numeric id returns 404 (RN 22) | 404 Not Found | API |
| C42 | Updating a non-numeric id returns 404, not 500 (RN 22) | 404 Not Found | API |
| C43 | An update without authentication is rejected (RN 23) | 401 Unauthorized | API |

### US 6: Delete a Game (DELETE /games/{id})

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C44 | Deleting an existing game returns 204 with no response body (RN 21) | 204 No Content; empty response body | API |
| C45 | Deleting a non-existent numeric id returns 404 (RN 22) | 404 Not Found | API |
| C46 | Deleting a non-numeric id returns 404, not 500 (RN 22) | 404 Not Found | API |
| C47 | A new game created after a deletion does not reuse the deleted id (RN 08) | 201 Created; new id does not match the deleted id | API |
| C48 | A new game created after deleting the highest-id game does not reuse that id (RN 08) | 201 Created; new id does not match the deleted (former highest) id | API |
| C49 | A deletion without authentication is rejected (RN 23) | 401 Unauthorized | API |

### US 7: List Questionnaire (GET /questions)

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C50 | The fixed set of three questions is returned (RN 24) | 200 OK; exactly 3 questions returned: playerCount, timeAvailable, complexity | API |
| C51 | The endpoint succeeds without authentication (RN 24) | 200 OK; no Authorization header required | API |
| C52 | The returned question ids match the ids recognized by the recommendation engine (RN 25) | All 3 ids match one-to-one (manual cross-check against matching.js; not verifiable through the API response alone) | API |

### US 8: Get Game Recommendations (POST /recommendations)

| ID | Condition | Expected Result | Layer |
|---|---|---|---|
| C53 | A request with a missing answers field is rejected (RN 26) | 400 Bad Request | API |
| C54 | A request where answers is not an array is rejected (RN 26) | 400 Bad Request | API |
| C55 | An answers entry that is null is rejected (RN 27) | 400 Bad Request; error references questionId | API |
| C56 | An answers entry missing questionId is rejected (RN 27) | 400 Bad Request; error references questionId | API |
| C57 | A duplicate questionId in the same request is rejected (RN 28) | 400 Bad Request; error references duplicate questionId | API |
| C58 | A player count within a game's min/max range matches that game (RN 29) | Game appears in the results | API |
| C59 | A player count outside a game's min/max range does not match (RN 29) | Game does not appear in the results based on this criterion | API |
| C60 | An available time equal to a game's playTime matches that game (RN 30) | Game appears in the results | API |
| C61 | An available time less than a game's playTime does not match (RN 30) | Game does not appear in the results based on this criterion | API |
| C62 | A complexity request within 1 point of a game's complexity matches (RN 31) | Game appears in the results | API |
| C63 | A complexity request more than 1 point away does not match (RN 31) | Game does not appear in the results based on this criterion | API |
| C64 | A game with complexity: null is never evaluated against the complexity criterion (RN 32) | Game is not scored on complexity, but may still appear via other matched criteria | API |
| C65 | An unrecognized questionId does not affect scoring or produce an error (RN 33) | 200 OK; response unaffected by the unrecognized questionId | API |
| C66 | A game matching zero criteria is excluded from the results (RN 34) | Game is absent from the results | API |
| C67 | Results are ranked by number of matched criteria, highest first (RN 35) | Results are ordered from most matched criteria to fewest | API |
| C68 | No more than 3 games are returned even when more are eligible (RN 36) | At most 3 games are present in the results array | API |
| C69 | Each returned game includes an accurate explanation of matched criteria (RN 37) | Each game's reason field lists only the criteria it actually matched | API |
| C70 | The endpoint succeeds without authentication (RN 06) | 200 OK; no Authorization header required | API |

## 4. Exploratory Testing Missions

- Recommendations Engine — Explore POST /recommendations and the scoring/ranking logic in matching.js, with hand-crafted answer sets and the real 244-game collection, to discover whether scoring, ranking, result-capping, and null-complexity handling behave correctly at the edges.
- Questionnaire Endpoint — Explore GET /questions, with data/questions.json and the matching.js source, to discover whether every questionId returned is actually recognized and scored by the matching logic.
- Auth Session Lifecycle — Explore the full JWT lifecycle across multiple protected routes, with a single login session and Postman/curl, to discover whether a token behaves consistently across a continuous sequence of actions, not just in isolated checks.
- Games — Full Lifecycle Scenario — Explore a single game record's full life across all /games verbs in one continuous flow, with Postman/curl, to discover whether data stays consistent and id-reuse rules hold up across a realistic multi-step story.
- Authorization Boundary Sweep — Explore authentication and authorization enforcement across every protected route, with tampered/forged JWTs and alternate HTTP methods, to discover whether any request can reach a protected action without a genuinely valid token.
- OpenAPI/Swagger Accuracy — Explore the /api-docs specification against real API responses, with the running API and Swagger UI, to discover whether documented examples, status codes, and schemas match actual behavior.
- Data Storage Under Concurrent Access — Explore data/games.json under near-simultaneous write requests, with two parallel requests fired manually, to discover whether concurrent writes can silently lose data.

## 5. Non-Functional Tests

| Type | Test | Expected Result |
|---|---|---|
| Performance | Measure response time of GET /games under the current full dataset (244 games) | To be defined |
| Performance | Measure response time of POST /recommendations when scoring against the full dataset | To be defined |
| Performance | Fire two POST /games requests as close together as possible and check whether both writes persist | To be defined |
| Performance | Measure response time under repeated rapid sequential requests (e.g. 50 consecutive GET /games calls) | To be defined |
| Security | Attempt authentication bypass using a JWT with its "alg" header set to "none" | Request is rejected with 401 |
| Security | Attempt to use a token signed with an incorrect secret | Request is rejected with 401 |
| Security | Submit a malformed JSON body to a protected endpoint | A clean 400 JSON error is returned, with no stack trace or file path exposed |
| Security | Attempt repeated login submissions with the wrong password | Each attempt is independently rejected with 401 (no rate-limiting is currently implemented — noted as a possible future enhancement, not a defect) |

## 6. Test Automation

The entire scope of Section 3 (all 70 conditions, C01-C70) is automated, since this project is focused exclusively on API-layer test automation.

## 7. Test Data Mapping

| Data | Type | Responsible | Status |
|---|---|---|---|
| Games collection | JSON fixture file | N/A — managed in project fixtures | N/A — managed in project fixtures |
| Auth credentials | Environment variables (.env) | N/A — managed in project fixtures | N/A — managed in project fixtures |
| Recommendation answer payloads | Hand-crafted JSON request bodies | N/A — managed in project fixtures | N/A — managed in project fixtures |

## 8. Known Defects

| ID | Defect | Layer |
|---|---|---|
| D01 | PATCH does not validate minPlayers <= maxPlayers when only one of the two fields is sent — the relational check (RN 12) only applies when both fields are present in the same request, not against the currently stored record. | API |
| D02 | The flat-file JSON storage has no write-locking. Near-simultaneous write requests can overwrite each other, with the last write silently winning. | API |

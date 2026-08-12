const express = require('express');
const gameStore = require('../services/gameStore');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const GAME_FIELD_TYPES = {
  name: 'string',
  minPlayers: 'number',
  maxPlayers: 'number',
  playTime: 'number',
  complexity: 'number',
};

function validateFullGamePayload(body) {
  const { name, minPlayers, maxPlayers, playTime, complexity } = body;

  if (
    !name ||
    typeof minPlayers !== 'number' ||
    typeof maxPlayers !== 'number' ||
    typeof playTime !== 'number' ||
    typeof complexity !== 'number'
  ) {
    return 'Missing or invalid fields. Required: name (string), minPlayers (number), maxPlayers (number), playTime (number), complexity (number).';
  }

  return null;
}

function validatePartialGamePayload(body) {
  const updates = {};

  for (const field of Object.keys(GAME_FIELD_TYPES)) {
    if (body[field] === undefined) continue;

    const isValid = field === 'name' ? Boolean(body[field]) : typeof body[field] === 'number';
    if (!isValid) {
      return { error: `Invalid field: ${field} must be a ${GAME_FIELD_TYPES[field]}.` };
    }

    updates[field] = body[field];
  }

  return { updates };
}

/**
 * @openapi
 * /games:
 *   get:
 *     summary: List all games in the collection
 *     tags:
 *       - Games
 *     responses:
 *       200:
 *         description: Array of games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Catan
 *                   minPlayers:
 *                     type: integer
 *                     example: 3
 *                   maxPlayers:
 *                     type: integer
 *                     example: 4
 *                   playTime:
 *                     type: integer
 *                     example: 90
 *                   complexity:
 *                     type: number
 *                     nullable: true
 *                     description: BGG-style complexity weight, 1 (light) to 5 (heavy)
 *                     example: 2.5
 */
router.get('/', (req, res) => {
  const games = gameStore.listGames();
  res.json(games);
});

/**
 * @openapi
 * /games:
 *   post:
 *     summary: Add a game to the collection
 *     tags:
 *       - Games
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - minPlayers
 *               - maxPlayers
 *               - playTime
 *               - complexity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Catan
 *               minPlayers:
 *                 type: integer
 *                 example: 3
 *               maxPlayers:
 *                 type: integer
 *                 example: 4
 *               playTime:
 *                 type: integer
 *                 description: Average play time in minutes
 *                 example: 90
 *               complexity:
 *                 type: number
 *                 description: BGG-style complexity weight, 1 (light) to 5 (heavy)
 *                 example: 2.5
 *     responses:
 *       201:
 *         description: Game created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 245
 *                 name:
 *                   type: string
 *                   example: Catan
 *                 minPlayers:
 *                   type: integer
 *                   example: 3
 *                 maxPlayers:
 *                   type: integer
 *                   example: 4
 *                 playTime:
 *                   type: integer
 *                   example: 90
 *                 complexity:
 *                   type: number
 *                   example: 2.5
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: >-
 *                     Missing or invalid fields. Required: name (string), minPlayers (number),
 *                     maxPlayers (number), playTime (number), complexity (number).
 */
router.post('/', requireAuth, (req, res) => {
  const validationError = validateFullGamePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, minPlayers, maxPlayers, playTime, complexity } = req.body;
  const newGame = gameStore.addGame({ name, minPlayers, maxPlayers, playTime, complexity });
  res.status(201).json(newGame);
});

/**
 * @openapi
 * /games/{id}:
 *   put:
 *     summary: Replace a game (full update, idempotent)
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - minPlayers
 *               - maxPlayers
 *               - playTime
 *               - complexity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Catan
 *               minPlayers:
 *                 type: integer
 *                 example: 3
 *               maxPlayers:
 *                 type: integer
 *                 example: 4
 *               playTime:
 *                 type: integer
 *                 example: 90
 *               complexity:
 *                 type: number
 *                 description: BGG-style complexity weight, 1 (light) to 5 (heavy)
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Game replaced
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Catan
 *                 minPlayers:
 *                   type: integer
 *                   example: 3
 *                 maxPlayers:
 *                   type: integer
 *                   example: 4
 *                 playTime:
 *                   type: integer
 *                   example: 90
 *                 complexity:
 *                   type: number
 *                   example: 2.5
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: >-
 *                     Missing or invalid fields. Required: name (string), minPlayers (number),
 *                     maxPlayers (number), playTime (number), complexity (number).
 *       404:
 *         description: No game with that id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Game with id 1 not found.
 */
router.put('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);

  const validationError = validateFullGamePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, minPlayers, maxPlayers, playTime, complexity } = req.body;
  const updatedGame = gameStore.replaceGame(id, { name, minPlayers, maxPlayers, playTime, complexity });

  if (!updatedGame) {
    return res.status(404).json({ error: `Game with id ${req.params.id} not found.` });
  }

  res.json(updatedGame);
});

/**
 * @openapi
 * /games/{id}:
 *   patch:
 *     summary: Partially update a game
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any subset of the game's fields. Only the fields sent are updated.
 *             properties:
 *               name:
 *                 type: string
 *                 example: Catan
 *               minPlayers:
 *                 type: integer
 *                 example: 3
 *               maxPlayers:
 *                 type: integer
 *                 example: 4
 *               playTime:
 *                 type: integer
 *                 example: 90
 *               complexity:
 *                 type: number
 *                 description: BGG-style complexity weight, 1 (light) to 5 (heavy). Cannot be set to null.
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Game updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Catan
 *                 minPlayers:
 *                   type: integer
 *                   example: 3
 *                 maxPlayers:
 *                   type: integer
 *                   example: 4
 *                 playTime:
 *                   type: integer
 *                   example: 90
 *                 complexity:
 *                   type: number
 *                   example: 2.5
 *       400:
 *         description: A sent field failed type validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid field: complexity must be a number."
 *       404:
 *         description: No game with that id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Game with id 1 not found.
 */
router.patch('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);

  const { updates, error } = validatePartialGamePayload(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const updatedGame = gameStore.patchGame(id, updates);
  if (!updatedGame) {
    return res.status(404).json({ error: `Game with id ${req.params.id} not found.` });
  }

  res.json(updatedGame);
});

/**
 * @openapi
 * /games/{id}:
 *   delete:
 *     summary: Remove a game from the collection
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Game deleted
 *       404:
 *         description: No game with that id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Game with id 1 not found.
 */
router.delete('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);

  const deleted = gameStore.deleteGame(id);
  if (!deleted) {
    return res.status(404).json({ error: `Game with id ${req.params.id} not found.` });
  }

  res.status(204).send();
});

module.exports = router;

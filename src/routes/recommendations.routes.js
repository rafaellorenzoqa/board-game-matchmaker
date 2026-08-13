const express = require('express');
const gameStore = require('../services/gameStore');
const { getRecommendations } = require('../services/matching');

const router = express.Router();

/**
 * @openapi
 * /recommendations:
 *   post:
 *     summary: Get 1-3 game recommendations based on questionnaire answers
 *     tags:
 *       - Recommendations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - answer
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       example: playerCount
 *                     answer:
 *                       description: Answer value; type depends on the question (number, string, etc.)
 *                       example: 4
 *     responses:
 *       200:
 *         description: 1-3 recommended games with a reason for each match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   maxItems: 3
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Catan
 *                       minPlayers:
 *                         type: integer
 *                         example: 3
 *                       maxPlayers:
 *                         type: integer
 *                         example: 4
 *                       playTime:
 *                         type: integer
 *                         example: 90
 *                       complexity:
 *                         type: number
 *                         nullable: true
 *                         example: 2.5
 *                       reason:
 *                         type: string
 *                         example: "Supports 4 players (range 3-4); Fits your available time (~90 min)"
 *       400:
 *         description: Missing/invalid "answers" array, or a malformed entry within it
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               missingOrInvalidAnswers:
 *                 summary: '"answers" is missing or not an array'
 *                 value:
 *                   error: Request body must include "answers" as an array of { questionId, answer } objects.
 *               malformedAnswerEntry:
 *                 summary: An entry in "answers" isn't an object with a string questionId
 *                 value:
 *                   error: Each entry in "answers" must be an object with a string "questionId".
 */
router.post('/', (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      error: 'Request body must include "answers" as an array of { questionId, answer } objects.',
    });
  }

  const hasMalformedEntry = answers.some(
    (entry) => typeof entry !== 'object' || entry === null || typeof entry.questionId !== 'string'
  );
  if (hasMalformedEntry) {
    return res.status(400).json({
      error: 'Each entry in "answers" must be an object with a string "questionId".',
    });
  }

  const games = gameStore.listGames();
  const recommendations = getRecommendations(answers, games);

  res.json({ recommendations });
});

module.exports = router;

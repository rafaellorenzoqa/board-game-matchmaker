const express = require('express');
const path = require('path');
const { readJsonFile } = require('../utils/jsonFile');

const router = express.Router();
const QUESTIONS_FILE = path.join(__dirname, '..', '..', 'data', 'questions.json');

/**
 * @openapi
 * /questions:
 *   get:
 *     summary: List the matchmaking questionnaire
 *     tags:
 *       - Questions
 *     responses:
 *       200:
 *         description: Array of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: playerCount
 *                   text:
 *                     type: string
 *                     example: How many players will be playing?
 *                   type:
 *                     type: string
 *                     example: number
 */
router.get('/', (req, res) => {
  const questions = readJsonFile(QUESTIONS_FILE);
  res.json(questions);
});

module.exports = router;

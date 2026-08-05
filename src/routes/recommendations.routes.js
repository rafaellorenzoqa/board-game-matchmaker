const express = require('express');
const gameStore = require('../services/gameStore');
const { getRecommendations } = require('../services/matching');

const router = express.Router();

router.post('/', (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      error: 'Request body must include "answers" as an array of { questionId, answer } objects.',
    });
  }

  const games = gameStore.listGames();
  const recommendations = getRecommendations(answers, games);

  res.json({ recommendations });
});

module.exports = router;

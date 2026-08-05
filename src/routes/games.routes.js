const express = require('express');
const gameStore = require('../services/gameStore');

const router = express.Router();

router.get('/', (req, res) => {
  const games = gameStore.listGames();
  res.json(games);
});

router.post('/', (req, res) => {
  const { name, minPlayers, maxPlayers, playTime, complexity, tags } = req.body;

  if (
    !name ||
    typeof minPlayers !== 'number' ||
    typeof maxPlayers !== 'number' ||
    typeof playTime !== 'number' ||
    !complexity ||
    !Array.isArray(tags)
  ) {
    return res.status(400).json({
      error:
        'Missing or invalid fields. Required: name (string), minPlayers (number), maxPlayers (number), playTime (number), complexity (string), tags (array).',
    });
  }

  const newGame = gameStore.addGame({ name, minPlayers, maxPlayers, playTime, complexity, tags });
  res.status(201).json(newGame);
});

module.exports = router;

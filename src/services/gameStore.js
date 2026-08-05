const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/jsonFile');

const GAMES_FILE = path.join(__dirname, '..', '..', 'data', 'games.json');

function listGames() {
  return readJsonFile(GAMES_FILE);
}

function addGame(game) {
  const games = listGames();
  const nextId = games.length > 0 ? Math.max(...games.map((g) => g.id)) + 1 : 1;
  const newGame = { id: nextId, ...game };

  games.push(newGame);
  writeJsonFile(GAMES_FILE, games);

  return newGame;
}

module.exports = { listGames, addGame };

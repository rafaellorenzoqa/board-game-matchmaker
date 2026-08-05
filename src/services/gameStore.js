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

function replaceGame(id, game) {
  const games = listGames();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGame = { id, ...game };
  games[index] = updatedGame;
  writeJsonFile(GAMES_FILE, games);

  return updatedGame;
}

function patchGame(id, updates) {
  const games = listGames();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGame = { ...games[index], ...updates };
  games[index] = updatedGame;
  writeJsonFile(GAMES_FILE, games);

  return updatedGame;
}

function deleteGame(id) {
  const games = listGames();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return false;

  games.splice(index, 1);
  writeJsonFile(GAMES_FILE, games);

  return true;
}

module.exports = { listGames, addGame, replaceGame, patchGame, deleteGame };

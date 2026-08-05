const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/jsonFile');

const GAMES_FILE = path.join(__dirname, '..', '..', 'data', 'games.json');

function listGames(filePath = GAMES_FILE) {
  return readJsonFile(filePath);
}

function addGame(game, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const nextId = games.length > 0 ? Math.max(...games.map((g) => g.id)) + 1 : 1;
  const newGame = { id: nextId, ...game };

  games.push(newGame);
  writeJsonFile(filePath, games);

  return newGame;
}

function replaceGame(id, game, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGame = { id, ...game };
  games[index] = updatedGame;
  writeJsonFile(filePath, games);

  return updatedGame;
}

function patchGame(id, updates, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGame = { ...games[index], ...updates };
  games[index] = updatedGame;
  writeJsonFile(filePath, games);

  return updatedGame;
}

function deleteGame(id, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return false;

  games.splice(index, 1);
  writeJsonFile(filePath, games);

  return true;
}

module.exports = { listGames, addGame, replaceGame, patchGame, deleteGame };

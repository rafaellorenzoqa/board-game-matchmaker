const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/jsonFile');

const GAMES_FILE = process.env.GAMES_FILE_PATH
  ? path.resolve(process.env.GAMES_FILE_PATH)
  : path.join(__dirname, '..', '..', 'data', 'games.json');

function getIdCounterFilePath(filePath) {
  return filePath.replace(/\.json$/i, '.counter.json');
}

function readIdCounter(filePath) {
  try {
    return readJsonFile(getIdCounterFilePath(filePath));
  } catch {
    return null;
  }
}

// Records the highest game id ever issued for this games file. RN08 requires
// ids to never be reused, even after the game holding the current max id is
// deleted - a plain max(existing ids) + 1 forgets that id the moment it's
// deleted. This sidecar file remembers it. It's only ever reset together
// with the games data itself, via resetGamesForTesting(), so it can always
// be trusted here without any extra checks.
function persistIdCounter(filePath, games) {
  const priorCounter = readIdCounter(filePath);
  const currentMaxId = games.length > 0 ? Math.max(...games.map((g) => g.id)) : 0;
  const lastId = Math.max(priorCounter ? priorCounter.lastId : 0, currentMaxId);

  writeJsonFile(getIdCounterFilePath(filePath), { lastId });
}

function getNextId(filePath, games) {
  const currentMaxId = games.length > 0 ? Math.max(...games.map((g) => g.id)) : 0;
  const counter = readIdCounter(filePath);
  const lastId = counter ? counter.lastId : 0;

  return Math.max(lastId, currentMaxId) + 1;
}

function listGames(filePath = GAMES_FILE) {
  return readJsonFile(filePath);
}

// Resets the games file and its id counter together, so the two can never
// drift apart. Intended for test setup only - production code never
// rewrites the games file wholesale.
function resetGamesForTesting(games, filePath = GAMES_FILE) {
  writeJsonFile(filePath, games);
  writeJsonFile(getIdCounterFilePath(filePath), { lastId: 0 });
}

function addGame(game, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const nextId = getNextId(filePath, games);
  const newGame = { id: nextId, ...game };

  games.push(newGame);
  writeJsonFile(filePath, games);
  persistIdCounter(filePath, games);

  return newGame;
}

function replaceGame(id, game, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGame = { id, ...game };
  games[index] = updatedGame;
  writeJsonFile(filePath, games);
  persistIdCounter(filePath, games);

  return updatedGame;
}

function patchGame(id, updates, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const updatedGame = { ...games[index], ...updates };
  games[index] = updatedGame;
  writeJsonFile(filePath, games);
  persistIdCounter(filePath, games);

  return updatedGame;
}

function deleteGame(id, filePath = GAMES_FILE) {
  const games = listGames(filePath);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return false;

  persistIdCounter(filePath, games);
  games.splice(index, 1);
  writeJsonFile(filePath, games);
  persistIdCounter(filePath, games);

  return true;
}

module.exports = { listGames, addGame, replaceGame, patchGame, deleteGame, resetGamesForTesting };

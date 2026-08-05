const PLAYER_COUNT_MATCH_SCORE = 3;
const TIME_MATCH_SCORE = 2;
const COMPLEXITY_MATCH_SCORE = 2;
const TAG_MATCH_SCORE = 1;

function getAnswer(answers, questionId) {
  const found = answers.find((a) => a.questionId === questionId);
  return found ? found.answer : undefined;
}

function scoreGame(game, answers) {
  let score = 0;
  const reasons = [];

  const playerCount = getAnswer(answers, 'playerCount');
  if (typeof playerCount === 'number') {
    if (playerCount >= game.minPlayers && playerCount <= game.maxPlayers) {
      score += PLAYER_COUNT_MATCH_SCORE;
      reasons.push(`Supports ${playerCount} players (range ${game.minPlayers}-${game.maxPlayers})`);
    }
  }

  const timeAvailable = getAnswer(answers, 'timeAvailable');
  if (typeof timeAvailable === 'number') {
    if (game.playTime <= timeAvailable) {
      score += TIME_MATCH_SCORE;
      reasons.push(`Fits your available time (~${game.playTime} min)`);
    }
  }

  const complexity = getAnswer(answers, 'complexity');
  if (complexity && game.complexity === complexity) {
    score += COMPLEXITY_MATCH_SCORE;
    reasons.push(`Matches your preferred complexity (${complexity})`);
  }

  const preferredTags = getAnswer(answers, 'preferredTags');
  if (Array.isArray(preferredTags) && Array.isArray(game.tags)) {
    const matchedTags = game.tags.filter((tag) => preferredTags.includes(tag));
    if (matchedTags.length > 0) {
      score += matchedTags.length * TAG_MATCH_SCORE;
      reasons.push(`Matches tags: ${matchedTags.join(', ')}`);
    }
  }

  return { score, reasons };
}

function getRecommendations(answers, games, { maxResults = 3 } = {}) {
  const scored = games
    .map((game) => {
      const { score, reasons } = scoreGame(game, answers);
      return { game, score, reasons };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map(({ game, reasons }) => ({
    ...game,
    reason: reasons.join('; '),
  }));
}

module.exports = { getRecommendations, scoreGame };

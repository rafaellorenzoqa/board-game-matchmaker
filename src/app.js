require('dotenv').config();

const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRouter = require('./routes/auth.routes');
const gamesRouter = require('./routes/games.routes');
const questionsRouter = require('./routes/questions.routes');
const recommendationsRouter = require('./routes/recommendations.routes');
const { RECOGNIZED_QUESTION_IDS } = require('./services/matching');
const { readJsonFile } = require('./utils/jsonFile');

const QUESTIONS_FILE = path.join(__dirname, '..', 'data', 'questions.json');

function assertQuestionIdsInSync() {
  const questionIds = readJsonFile(QUESTIONS_FILE).map((q) => q.id);

  const unrecognized = questionIds.filter((id) => !RECOGNIZED_QUESTION_IDS.includes(id));
  const undocumented = RECOGNIZED_QUESTION_IDS.filter((id) => !questionIds.includes(id));

  if (unrecognized.length > 0 || undocumented.length > 0) {
    throw new Error(
      'Question ID mismatch between data/questions.json and matching.js\'s recognized question IDs. ' +
      `In questions.json but not recognized by matching.js: [${unrecognized.join(', ')}]. ` +
      `Recognized by matching.js but missing from questions.json: [${undocumented.join(', ')}].`
    );
  }
}

assertQuestionIdsInSync();

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRouter);
app.use('/games', gamesRouter);
app.use('/questions', questionsRouter);
app.use('/recommendations', recommendationsRouter);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

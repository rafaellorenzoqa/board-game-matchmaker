const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const gamesRouter = require('./routes/games.routes');
const questionsRouter = require('./routes/questions.routes');
const recommendationsRouter = require('./routes/recommendations.routes');

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

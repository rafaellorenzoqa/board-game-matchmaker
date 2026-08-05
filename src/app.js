const express = require('express');
const gamesRouter = require('./routes/games.routes');
const questionsRouter = require('./routes/questions.routes');
const recommendationsRouter = require('./routes/recommendations.routes');

const app = express();

app.use(express.json());

app.use('/games', gamesRouter);
app.use('/questions', questionsRouter);
app.use('/recommendations', recommendationsRouter);

module.exports = app;

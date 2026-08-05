const express = require('express');
const path = require('path');
const { readJsonFile } = require('../utils/jsonFile');

const router = express.Router();
const QUESTIONS_FILE = path.join(__dirname, '..', '..', 'data', 'questions.json');

router.get('/', (req, res) => {
  const questions = readJsonFile(QUESTIONS_FILE);
  res.json(questions);
});

module.exports = router;

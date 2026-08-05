const swaggerJsdoc = require('swagger-jsdoc');
const packageJson = require('../../package.json');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Board Game Matchmaker API',
      version: packageJson.version,
    },
  },
  apis: ['./src/routes/*.js'],
});

module.exports = swaggerSpec;

process.env.GAMES_FILE_PATH = require('path').join(__dirname, 'fixtures', 'games.json');

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { resetGamesForTesting } = require('../../src/services/gameStore');
const initialGames = require('../fixtures/initialGames');

async function getAuthToken() {
    const response = await request(app)
        .post('/auth/login')
        .send({
            username: process.env.AUTH_USERNAME,
            password: process.env.AUTH_PASSWORD
        });
    if (!response.body.token) {
        throw new Error(`Login failed in test setup:  ${JSON.stringify(response.body)}`)
    }
    return response.body.token;
}

function resetFixture() {
    resetGamesForTesting(initialGames, process.env.GAMES_FILE_PATH);
}

module.exports = {
    app,
    request,
    expect,
    initialGames,
    getAuthToken,
    resetFixture
};

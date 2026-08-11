process.env.GAMES_FILE_PATH = require('path').join(__dirname, 'fixtures', 'games.json');

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { writeJsonFile } = require('../../src/utils/jsonFile');
const initialGames = require('../fixtures/initialGames');


describe('/games', async () => {

    beforeEach(() => {
        writeJsonFile(process.env.GAMES_FILE_PATH, initialGames); // path, data.
    })

    describe('GET', () => {
        it('GET /games must return a list of games', async () => {
            const response = await request(app)
                .get('/games');

            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(4);
        })
    })

    describe('', () => {
        
    })

})
process.env.GAMES_FILE_PATH = require('path').join(__dirname, 'fixtures', 'games.json');

const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { writeJsonFile } = require('../../src/utils/jsonFile');
const initialGames = require('../fixtures/initialGames');
const { deepEqual } = require('assert');


describe('/games', () => {

    beforeEach(() => {
        writeJsonFile(process.env.GAMES_FILE_PATH, initialGames); // path, data.
    })

    describe('GET /games', () => {

        it('Must return a list of games', async () => {
            const response = await request(app)
                .get('/games');

            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(4);
        })
    })

    //POST /games in test/api/ — at least: 
    // valid payload → 201 + correct shape, 
    // missing field → 400, 
    // complexity: null → 400 (the rule you specifically decided on).
    describe('POST /games', () => {

        it('Must return 201 on valid game creation', async () => {
            const response = await request(app)
                .post('/games')
                .send({
                    name: 'Speakeasy',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(201);
            expect(response.body.name).to.eq('Speakeasy');
            expect(response.body.minPlayers).to.eq(1);
            expect(response.body.maxPlayers).to.eq(4);
            expect(response.body.playTime).to.eq(90);
            expect(response.body.complexity).to.eq(3.1);
            expect(response.body).to.have.property("id");
            expect(response.body.id).to.eq(117);

        })

        it('Must return 400 when the playload is missing a field (name is missing)', async () => {
            const response = await request(app)
                .post('/games')
                .send({
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
        })

        it('Must return 400 on null parameter (complexity: null)', async () => {
            const response = await request(app)
                .post('/games')
                .send({
                    name: 'Pest',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 120,
                    complexity: null
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.contain('complexity');
        })
    })

    describe('PUT /games/{id}', () => {

        it('Must return 200 when a game is replaced', async () => {
            const response = await request(app)
                .put('/games/1')
                .send({
                    "name": "Catan: Navegantes",
                    "minPlayers": 3,
                    "maxPlayers": 4,
                    "playTime": 90,
                    "complexity": 2.5
                });

            const response2 = await request(app)
                .put('/games/1')
                .send({
                    "name": "Catan: Navegantes",
                    "minPlayers": 3,
                    "maxPlayers": 4,
                    "playTime": 90,
                    "complexity": 2.5
                });

            expect(response.status).to.eq(200);
            expect(response.body.name).to.eq("Catan: Navegantes");

            expect(response2.status).to.eq(200);
            expect(response.body).to.deep.equal(response2.body);

        })
    })

})
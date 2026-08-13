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


describe('/games', () => {

    let token;

    before(async () => {
        token = await getAuthToken();
    })

    beforeEach(() => {
        resetGamesForTesting(initialGames, process.env.GAMES_FILE_PATH);
    })

    describe('GET /games', () => {

        it('Must return a list of games', async () => {
            const response = await request(app)
                .get('/games');

            expect(response.status).to.eq(200);
            expect(response.body.length).to.eq(4);
        })
    })

    describe('POST /games', () => {

        it('Must return 201 on valid game creation', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
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

        it('Must return 400 when "name" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "minPlayers" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "maxPlayers" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    minPlayers: 3,
                    playTime: 90,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "playTime" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    minPlayers: 3,
                    maxPlayers: 4,
                    complexity: 3.1
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 when "complexity" is missing from the payload', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan 2",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                });
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 400 on null parameter (complexity: null)', async () => {
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${token}`)
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

        it('Must return 401 if auth token is missing', async () => {
            const response = await request(app)
                .post('/games')
                .send({
                    name: 'Speakeasy',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.contain('Authorization');
        })

        it('Must return 401 if auth token is invalid', async () => {
            const badToken = "abcd";
            const response = await request(app)
                .post('/games')
                .set('Authorization', `Bearer ${badToken}`)
                .send({
                    name: 'Speakeasy',
                    minPlayers: 1,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 3.1
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.contain('Invalid');
        })

    })

    describe('PUT /games/{id}', () => {

        it('Must return 200 when a game is replaced', async () => {
            const response = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                });

            const response2 = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                });

            expect(response.status).to.eq(200);
            expect(response.body.name).to.eq("Catan: Navegantes");

            expect(response2.status).to.eq(200);
            expect(response.body).to.deep.equal(response2.body);

        })

        it('Must return 400 when the payload is incomplete (missing property)', async () => {
            const response = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Missing");
        })

        it('Must return 401 if auth token is missing', async () => {
            const response = await request(app)
                .put('/games/1')
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 6,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Authorization");
        })

        it('Must return 401 if auth token is invalid', async () => {
            const badToken = "abcd";
            const response = await request(app)
                .put('/games/1')
                .set('Authorization', `Bearer ${badToken}`)
                .send({
                    name: "Catan: Navegantes",
                    minPlayers: 3,
                    maxPlayers: 6,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("Invalid");
        })

        it('Must return 404 if the game ID is not found', async () => {
            const response = await request(app)
                .put('/games/666')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Robo Rescue",
                    minPlayers: 3,
                    maxPlayers: 6,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(404);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("not found");
        })
    })

    describe('PATCH /games/{id}', () => {
        it('Must return 200 when a game is edited', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Catan: Cities and Knights"
                });

            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(1);
            expect(response.body.name).to.eq("Catan: Cities and Knights");
        })

        it('Must return 400 if property complexity is null', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    complexity: null
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("complexity");
        })

        it('Must return 400 if property complexity is not a number', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    complexity: "3.2"
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("complexity");
        })

        it('Must return 400 if property name is not a string', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 123
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("string");
        })

        it('Must return 400 if property minPlayers is not a number', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    minPlayers: "1"
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("minPlayers");
        })

        it('Must return 400 if property maxPlayers is not a number', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    maxPlayers: "5"
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("maxPlayers");
        })

        it('Must return 400 if property playtime is not a number', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    playTime: "1"
                })
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain("playTime");
        })

        it('Must return 401 if the auth token is missing', async () => {
            const response = await request(app)
                .patch('/games/2')
                .send({
                    name: "Not really Acquire",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain('Authorization');
        })

        it('Must return 401 if the auth token is invalid', async () => {
            const badToken = "abcd";
            const response = await request(app)
                .patch('/games/2')
                .set('Authorization', `Bearer ${badToken}`)
                .send({
                    name: "Not really Acquire",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain('Invalid');
        })

        it('Must return 404 if game ID is not found', async () => {
            const response = await request(app)
                .patch('/games/666')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Not really Acquire",
                    minPlayers: 3,
                    maxPlayers: 4,
                    playTime: 90,
                    complexity: 2.5
                })
            expect(response.status).to.eq(404);
            expect(response.body).to.have.property("error");
            expect(response.body.error).to.contain('not found');
        })

        it('Must only patch the property sent and not touch the others', async () => {
            const response = await request(app)
                .patch('/games/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Trickerion - Legends of Illusion"
                })
            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(1);
            expect(response.body.minPlayers).to.eq(3);
            expect(response.body.maxPlayers).to.eq(4);
            expect(response.body.playTime).to.eq(90);
            expect(response.body.complexity).to.eq(2.5);
        })
    })

})
const { app, request, expect, getAuthToken, resetFixture } = require('./games.support');

describe('/games', () => {

    let token;

    before(async () => {
        token = await getAuthToken();
    })

    beforeEach(() => {
        resetFixture();
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
